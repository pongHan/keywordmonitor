const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// NODE_ENV에 따라 적절한 .env 파일 로드
const env = process.env.NODE_ENV || 'dev';
const envPath = path.resolve(__dirname, `.env.${env}`);

// 해당 환경 파일이 존재하면 로딩
dotenv.config({ path: envPath });
console.log(`✅ Loaded .env.${env}`);

// 테스트 출력
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_URL:', process.env.DB_URL);

const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Tesseract = require('tesseract.js');
const dayjs = require('dayjs');
const mysql = require('mysql2/promise');
const {
    log,
    sanitizeString,
    parseDate,
    extractDate,
    extractLink,
    extractTitle,
    generateSelector,
    captureScreenshot,
    JOB_INTERVAL,
    RETRY_ATTEMPTS,
    RETRY_DELAY,
    SCREENSHOT_DIR,
    MAX_SCREENSHOTS
} = require('./modules/util.lib');

// 스텔스 플러그인 등록
puppeteer.use(StealthPlugin());

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, SENDER_EMAIL, SENDER_PASSWORD, SMTP_SERVER, SMTP_PORT, PORT, PASSPORT_CLIENT_ID, PASSPORT_CLIENT_SECRET } = require("./config.js");

// Database connection pool setup for MySQL
const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 설정
const RESET_SEEN_POSTS = false; // 디버깅용: true로 설정 시 seen_posts 초기화
const MAX_KEYWORDS = 10; // 최대 키워드 수 제한

// Parse check_interval (e.g., '1d', '6h', '1h', '1m') to milliseconds
function parseCheckInterval(interval) {
    if (!interval || typeof interval !== 'string') {
        log('error', `Invalid check_interval: not a string (value=${interval})`);
        return null;
    }
    // Trim and convert to lowercase to handle whitespace or case issues
    const cleanedInterval = interval.trim().toLowerCase();
    // Allow uppercase/lowercase d, h, m
    const match = cleanedInterval.match(/^(\d+)([dhm])$/i);
    if (!match) {
        log('error', `Invalid check_interval format: ${cleanedInterval}`);
        return null;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    //log('debug', `Parsed check_interval: value=${value}, unit=${unit}`);
    switch (unit) {
        case 'd': // Days
            return value * 24 * 60 * 60 * 1000;
        case 'h': // Hours
            return value * 60 * 60 * 1000;
        case 'm': // Minutes
            return value * 60 * 1000;
        default:
            log('error', `Unknown check_interval unit: ${unit}`);
            return null;
    }
}

// 설정 로드 (km_request 테이블에서)
async function loadConfigFromDB() {
    try {
        const query = `
            SELECT 
                req_id AS id,
                req_mb_id,
                receiver_email,
                board_name,
                board_type,
                post_url AS url,
                keyword,
                parsing_config,
                parsing_type,
                check_interval,
                req_status AS status,
                email_send_yn,
                start_date,
                end_date
            FROM km_request
            WHERE req_status = 'open'
        `;
        const [rows] = await db.query(query);
        const configs = rows.map(row => {
            const normalizedStatus = sanitizeString(row.status).toLowerCase();
            let keyword = sanitizeString(row.keyword);
            const board_name = sanitizeString(row.board_name);
            const check_interval = sanitizeString(row.check_interval);
            const receiver_email = sanitizeString(row.receiver_email);
            const url = sanitizeString(row.url);
            const parsing_type = sanitizeString(row.parsing_type);
            const req_mb_id = sanitizeString(row.req_mb_id);
            const email_send_yn = sanitizeString(row.email_send_yn);

            let keywords = keyword.split(',').map(k => k.trim()).filter(k => k.length > 0);
            if (keywords.length > MAX_KEYWORDS) {
                log('warning', `Too many keywords for req_id ${row.id} (${keywords.length} > ${MAX_KEYWORDS}). Using first ${MAX_KEYWORDS} keywords.`);
                keywords = keywords.slice(0, MAX_KEYWORDS);
            }
            log('debug', `Raw keyword for board ${board_name} (req_id: ${row.id}): "${row.keyword}" (parsed: ${JSON.stringify(keywords)})`);

            let parsingConfig;
            try {
                const parsingConfigRaw = sanitizeString(row.parsing_config);
                parsingConfig = parsingConfigRaw ? JSON.parse(parsingConfigRaw) : {};
            } catch (error) {
                log('error', `Failed to parse parsing_config for req_id ${row.id}: ${error.message}`);
                parsingConfig = {};
            }

            return {
                id: row.id,
                receiver_name: '수신자',
                receiver_email,
                url,
                keywords,
                board_type: sanitizeString(row.board_type),
                board_name,
                status: normalizedStatus,
                start_date: sanitizeString(row.start_date),
                end_date: sanitizeString(row.end_date),
                email_send_yn,
                parsing_config: parsingConfig,
                parsing_type,
                req_mb_id,
                check_interval: sanitizeString(row.check_interval) // e.g., '1d', '6h', '1h', '1m'
            };
        });
        log('info', `Loaded ${configs.length} configs from km_request`);
        return configs;
    } catch (error) {
        log('error', `Error loading config from km_request: ${error.message}`);
        return [];
    }
}

// 중복 게시물 체크
async function checkDuplicatePost(config, post) {
    let connection;
    try {
        connection = await db.getConnection();

        // Normalize post_url: Remove fragment identifiers and query parameters
        let normalizedUrl = post.link.split('#')[0].split('?')[0];
        try {
            const urlObj = new URL(normalizedUrl);
            normalizedUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
            normalizedUrl = normalizedUrl.replace(/\/+$/, '');
            normalizedUrl = decodeURI(normalizedUrl);
        } catch (error) {
            log('warning', `Failed to parse URL ${post.link} for normalization: ${error.message}`);
            normalizedUrl = post.link.split('#')[0].split('?')[0];
        }

        // Normalize post_title: Remove time suffix and trim
        const normalizedTitle = post.title.replace(/ㆍ[\d]+시간 전/, '').trim().toLowerCase();

        log('debug', `Checking duplicate for req_id=${config.id}, normalized_url=${normalizedUrl}, normalized_title=${normalizedTitle}`);

        // For navernews, use similarity-based duplicate check
        if (config.board_name.toLowerCase() === '네이버뉴스') {
            const fetchQuery = `
                SELECT detect_id, post_title
                FROM km_detect
                WHERE req_id = ?
                AND post_url = ?
            `;
            const fetchValues = [config.id, normalizedUrl];
            const [existingPosts] = await connection.query(fetchQuery, fetchValues);

            for (const existing of existingPosts) {
                const existingTitle = existing.post_title.replace(/ㆍ[\d]+시간 전/, '').trim().toLowerCase();
                const similarity = calculateSimilarity(normalizedTitle, existingTitle);
                log('debug', `Comparing titles: "${normalizedTitle}" vs "${existingTitle}" -> Similarity=${(similarity * 100).toFixed(2)}%`);
                if (similarity >= 0.9) {
                    log('info', `Duplicate found for req_id=${config.id}, post_url=${normalizedUrl}, post_title=${post.title} (similarity=${(similarity * 100).toFixed(2)}%)`);
                    return { isDuplicate: true, id: existing.detect_id };
                }
            }
            log('info', `New post for req_id=${config.id}, post_url=${normalizedUrl}, post_title=${post.title}`);
            return { isDuplicate: false };
        } else {
            // For other boards, use exact match
            const checkQuery = `
                SELECT detect_id
                FROM km_detect
                WHERE req_id = ?
                AND post_url = ?
                AND LOWER(post_title) = ?
                LIMIT 1
            `;
            const checkValues = [config.id, normalizedUrl, normalizedTitle];
            const [existing] = await connection.query(checkQuery, checkValues);
            if (existing.length > 0) {
                log('info', `Duplicate found for req_id=${config.id}, post_url=${normalizedUrl}, post_title=${post.title}`);
                return { isDuplicate: true, id: existing[0].detect_id };
            }
            log('info', `New post for req_id=${config.id}, post_url=${normalizedUrl}, post_title=${post.title}`);
            return { isDuplicate: false };
        }
    } catch (error) {
        log('error', `Error in checkDuplicatePost: ${error.message}`);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

// Calculate Levenshtein Distance between two strings
function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    // Initialize first row and column
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    // Fill the matrix
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // Deletion
                matrix[j - 1][i] + 1, // Insertion
                matrix[j - 1][i - 1] + indicator // Substitution
            );
        }
    }
    return matrix[b.length][a.length];
}

// Calculate similarity percentage between two strings
function calculateSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0; // Handle empty strings
    const distance = levenshteinDistance(str1, str2);
    return 1 - distance / maxLength;
}

// 게시물 삽입
async function insertNotificationData(config, post) {
    let connection;
    try {
        connection = await db.getConnection();
        const insertQuery = `
            INSERT INTO km_detect (
                req_id,
                req_mb_id,
                board_name,
                post_url,
                keyword,
                detect_datetime,
                post_title,
                detect_status
            ) VALUES (?, ?, ?, ?, ?, NOW(), ?, '1')
        `;
        const insertValues = [
            config.id,
            config.req_mb_id,
            config.board_name,
            post.link,
            post.keyword,
            post.title
        ];
        const [result] = await connection.query(insertQuery, insertValues);
        log('info', `Inserted notification data with ID: ${result.insertId} for keyword: ${post.keyword}`);
        return { inserted: true, detect_id: result.insertId };
    } catch (error) {
        log('error', `Error in insertNotificationData: ${error.message}`);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

// km_job_log에 로그 삽입
async function logToJobLog(config, result, nonDuplicatePosts, error = null) {
    let connection;
    try {
        connection = await db.getConnection();
        const insertQuery = `
            INSERT INTO km_job_log (
                req_id,
                board_name,
                check_interval,
                status,
                result,
                post_cnt,
                new_cnt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const status = error ? 'error' : 'success';
        const resultMessage = error
            ? `Error: ${error.message}`
            : `Fetched ${result.length} posts, ${nonDuplicatePosts.length} new`;
        const insertValues = [
            config.id,
            config.board_name,
            config.check_interval,
            status,
            resultMessage,
            result.length,
            nonDuplicatePosts.length
        ];
        const [insertResult] = await connection.query(insertQuery, insertValues);
        log('info', `Logged to km_job_log with log_id: ${insertResult.insertId} for req_id: ${config.id}`);
    } catch (dbError) {
        log('error', `Error logging to km_job_log for req_id ${config.id}: ${dbError.message}`);
    } finally {
        if (connection) connection.release();
    }
}

// km_finder_run에 로그 삽입/업데이트
async function logToFinderRun() {
    let connection;
    try {
        connection = await db.getConnection();
        const today = dayjs().format('YYYY-MM-DD');
        
        // 자정(0시 0분 0초) 설정
        const midnight = dayjs().startOf('day'); // 오늘 자정
        const now = dayjs();
        const elapsedMinutes = now.diff(midnight, 'minute'); // 자정부터 현재까지의 경과 시간(분)

        // 오늘 날짜의 행 확인
        const checkQuery = `
            SELECT run_id, run_cnt
            FROM km_finder_run
            WHERE run_date = ?
            LIMIT 1
        `;
        const [rows] = await connection.query(checkQuery, [today]);

        if (rows.length > 0) {
            // 행이 존재하면 run_cnt 증가, elapsed 업데이트, run_datetime 갱신
            const run_id = rows[0].run_id;
            const newRunCnt = rows[0].run_cnt + 1;
            const updateQuery = `
                UPDATE km_finder_run
                SET run_cnt = ?, elapsed = ?, run_datetime = NOW()
                WHERE run_id = ?
            `;
            await connection.query(updateQuery, [newRunCnt, elapsedMinutes, run_id]);
            log('info', `Updated km_finder_run: run_id=${run_id}, run_date=${today}, run_cnt=${newRunCnt}, elapsed=${elapsedMinutes} minutes`);
        } else {
            // 행이 없으면 새 행 삽입
            const insertQuery = `
                INSERT INTO km_finder_run (run_date, run_cnt, run_datetime, elapsed)
                VALUES (?, 1, NOW(), ?)
            `;
            const [result] = await connection.query(insertQuery, [today, elapsedMinutes]);
            log('info', `Inserted into km_finder_run: run_id=${result.insertId}, run_date=${today}, run_cnt=1, elapsed=${elapsedMinutes} minutes`);
        }
    } catch (error) {
        log('error', `Error in logToFinderRun: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
}

// OCR 실행
async function runOCR(imagePath) {
    log('info', '🔍 Running OCR...');
    try {
        // Try promise-based API
        const { data: { text } } = await Tesseract.recognize(imagePath, 'kor+eng');
        return text;
    } catch (error) {
        if (error.message.includes('cb')) {
            // Fallback to callback-based API
            log('warning', 'Falling back to callback-based Tesseract API');
            return new Promise((resolve, reject) => {
                Tesseract.recognize(imagePath, 'kor+eng', (err, result) => {
                    if (err) {
                        log('error', `OCR error: ${err.message}`);
                        reject(err);
                    } else {
                        resolve(result.data.text);
                    }
                });
            });
        }
        log('error', `OCR error: ${error.message}`);
        throw error;
    }
}

// 공통 이메일 전송 함수 (HTML 테이블 형식)
async function sendEmail({ subject, posts, receiverEmail, receiverName }) {
    const transporter = nodemailer.createTransport({
        host: SMTP_SERVER,
        port: SMTP_PORT,
        secure: false,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASSWORD,
        },
    });
    let tableRows = '';
    posts.forEach(post => {
        tableRows += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${post.title}</td>
                <td style="border: 1px solid #ddd; padding: 8px;"><a href="${post.link}">${post.link}</a></td>
                <td style="border: 1px solid #ddd; padding: 8px;">${post.date || ''}</td>
            </tr>
        `;
    });
    const htmlContent = `
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>새로운 게시물 알림</h2>
            <p>${receiverName}님, 안녕하세요!</p>
            <p>다음과 같은 새로운 게시물이 감지되었습니다:</p>
            <table style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px;">제목</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">링크</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">작성일</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `;
    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: receiverEmail,
            subject,
            html: htmlContent,
        });
        log('info', `Email sent to ${receiverEmail}: ${subject}`);
    } catch (error) {
        log('error', `Error sending email to ${receiverEmail}: ${error.message}`);
    }
}

// Puppeteer로 크롤링
function extractContent($, post, board_type) {
    if (board_type !== 'fmkorea') {
        return null;
    }
    const article = $(post).find('article').html();
    if (!article) {
        log('warning', 'No <article> element found in post');
        return null;
    }
    const $article = cheerio.load(article);
    const text = $article('article').text().replace(/\s+/g, ' ').trim();
    return text || null;
}

async function crawlWithPuppeteer(config) {
    const { url, keywords, board_type, board_name, parsing_config, receiver_email, receiver_name, email_send_yn } = config;
    let allResults = [];
    let allPostsToNotify = [];

    for (const keyword of keywords) {
        const modifiedUrl = url.replace('$keyword', encodeURIComponent(keyword));
        let attempt = 0;
        while (attempt < RETRY_ATTEMPTS) {
            try {
                const browser = await puppeteer.launch({ headless: 'new' });
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
                await page.goto(modifiedUrl, {
                    waitUntil: 'networkidle2',
                    timeout: 20000
                });
                const content = await page.content();
                await browser.close();
                const $ = cheerio.load(content);
                const posts = $(generateSelector(parsing_config.container));
                const result = [];
                const postsToNotify = [];
                const today = dayjs();
                posts.each((_, post) => {
                    let titleText = extractTitle($, post, parsing_config.title, board_type);
                    log('info', `title=${titleText} (keyword: ${keyword})`);
                    let link = extractLink($, post, parsing_config.link, modifiedUrl, titleText);
                    let postDate = extractDate($, post, parsing_config.date, board_type, today);
                    let postContent = extractContent($, post, board_type);
                    if (titleText && link) {
                        titleText = titleText.replace(/\s+/g, ' ').trim();
                        const normalizedTitle = titleText.toLowerCase();
                        if (normalizedTitle.includes(keyword)) {
                            result.push({ title: titleText, link, keyword, content: postContent });
                            if (postDate) {
                                const diff = today.diff(postDate, 'day');
                                if (diff <= 2) {
                                    log('info', `📬 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글이므로 메일 발송 (keyword: ${keyword})`);
                                    postsToNotify.push({ 
                                        title: titleText, 
                                        link, 
                                        date: postDate.format('YYYY-MM-DD'), 
                                        keyword, 
                                        content: postContent,
                                        wasNotified: true
                                    });
                                } else {
                                    log('info', `⏳ 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글 아님 (keyword: ${keyword})`);
                                }
                            } else {
                                log('info', `📅 작성일 정보를 찾을 수 없음 (keyword: ${keyword})`);
                                postsToNotify.push({ 
                                    title: titleText, 
                                    link, 
                                    date: null, 
                                    keyword, 
                                    content: postContent,
                                    wasNotified: true
                                });
                            }
                        }
                    } else {
                        log('warning', `Missing title or link in post at ${modifiedUrl} (keyword: ${keyword})`);
                    }
                });
                allResults = allResults.concat(result);
                allPostsToNotify = allPostsToNotify.concat(postsToNotify);
                break;
            } catch (error) {
                attempt++;
                log('warning', `Puppeteer error on attempt ${attempt} for keyword ${keyword}: ${error.message}`);
                if (attempt < RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    continue;
                } else {
                    log('error', `Failed to crawl ${modifiedUrl} after ${RETRY_ATTEMPTS} attempts for keyword ${keyword}: ${error.message}`);
                    return [];
                }
            }
        }
    }

    const nonDuplicatePosts = [];
    if (allPostsToNotify.length > 0) {
        for (const post of allPostsToNotify) {
            const duplicateCheck = await checkDuplicatePost(config, post);
            if (!duplicateCheck.isDuplicate) {
                await insertNotificationData(config, post);
                nonDuplicatePosts.push(post);
            }
        }
        if (nonDuplicatePosts.length > 0 && email_send_yn === 'Y') {
            await sendEmail({
                subject: `[알림] ${board_name} 키워드 "${keywords.join(', ')}" 관련 최근 게시물`,
                posts: nonDuplicatePosts,
                receiverEmail: receiver_email,
                receiverName: receiver_name,
            });
        } else {
            log('info', 'No new posts to notify after duplicate check.');
        }
    }

    log('debug', `Fetched ${allResults.length} posts from ${url} for keywords ${keywords.join(', ')}: ${JSON.stringify(allResults)}`);
    return allResults;
}

async function fetchBoard(config) {
    const { url, keywords, board_type, board_name, parsing_config, receiver_email, receiver_name, email_send_yn } = config;
    log('info', `>>>> ${board_name} ${board_type} ${keywords.join(', ')}`);
    const modifiedUrl = url.replace(/\$keyword/i, encodeURIComponent(keywords[0]));
    log('info', `🌐 Fetching board: ${modifiedUrl}`);
    const parsingType = parsing_config.parsing_type || 'text';
    let result = [];
    let nonDuplicatePosts = [];

    try {
        if (parsingType === 'ocr') {
            await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
            const screenshotPath = path.join(SCREENSHOT_DIR, `${Date.now()}_page.png`);
            log('info', '📸 Taking screenshot...');
            await captureScreenshot(modifiedUrl, screenshotPath);
            const ocrText = await runOCR(screenshotPath);
            log('debug', '📄 Extracted Text:\n' + ocrText);
            const lines = ocrText
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
            const postsToNotify = [];
            if (lines.length > 0) {
                log('info', `\n🔎 키워드 "${keywords.join(', ')}" 감지 결과:`);
                lines.forEach((line, index) => {
                    const normalizedLine = line.toLowerCase().replace(/\s+/g, ' ');
                    for (const keyword of keywords) {
                        if (normalizedLine.includes(keyword)) {
                            const link = `${modifiedUrl}#line_${index}`;
                            result.push({ title: line, link, keyword });
                            log('info', `${index + 1}. ${line} (Link: ${link}, keyword: ${keyword})`);
                            const formattedDate = parseDate(line);
                            if (formattedDate) {
                                const postDate = dayjs(formattedDate);
                                const today = dayjs();
                                const diff = today.diff(postDate, 'day');
                                if (diff <= 2) {
                                    log('info', `📬 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글이므로 메일 발송 (keyword: ${keyword})`);
                                    postsToNotify.push({ title: line, link, date: postDate.format('YYYY-MM-DD'), keyword, wasNotified: true });
                                } else {
                                    log('info', `⏳ 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글 아님 (keyword: ${keyword})`);
                                }
                            } else {
                                log('info', `📅 작성일 정보를 찾을 수 없음 (keyword: ${keyword})`);
                                postsToNotify.push({ title: line, link, date: null, keyword, wasNotified: true });
                            }
                            break;
                        }
                    }
                });

                if (postsToNotify.length > 0) {
                    for (const post of postsToNotify) {
                        const duplicateCheck = await checkDuplicatePost(config, post);
                        if (!duplicateCheck.isDuplicate) {
                            await insertNotificationData(config, post);
                            nonDuplicatePosts.push(post);
                        }
                    }
                    if (nonDuplicatePosts.length > 0 && email_send_yn === 'Y') {
                        await sendEmail({
                            subject: `[알림] 키워드 "${keywords.join(', ')}" 관련 최근 게시물`,
                            posts: nonDuplicatePosts,
                            receiverEmail: receiver_email,
                            receiverName: receiver_name,
                        });
                    } else {
                        log('info', 'No new posts to notify after duplicate check.');
                    }
                }
            } else {
                log('info', `\n❌ 키워드 "${keywords.join(', ')}"가 감지되지 않았습니다.`);
            }
        } else {
            result = await crawlWithPuppeteer(config);
            nonDuplicatePosts = result.filter(post => post.wasNotified);
        }
    } catch (error) {
        log('error', `Error in fetchBoard for ${board_name}: ${error.message}`);
        await logToJobLog(config, result, nonDuplicatePosts, error);
        throw error;
    }

    await logToJobLog(config, result, nonDuplicatePosts);
    log('debug', `Fetched ${result.length} posts from ${modifiedUrl} for keywords ${keywords.join(', ')}: ${JSON.stringify(result)}`);
    return result;
}

// 메인 함수
async function main() {
    let seenPosts = new Set();
    if (RESET_SEEN_POSTS) {
        seenPosts.clear();
        log('info', 'seenPosts cleared for debugging');
    }
    async function checkBoards() {
        const configs = await loadConfigFromDB();
        const today = dayjs();
        for (const config of configs) {
            const { id, receiver_name, receiver_email, url, keywords, board_type, board_name, status, start_date, end_date, parsing_config, check_interval } = config;
            if (!receiver_name || !receiver_email || !url || !keywords.length || !board_type || !board_name || !status || !start_date || !end_date || !parsing_config) {
                log('error', `Invalid config entry (ID: ${id}): ${JSON.stringify(config)}`);
                continue;
            }
            if (status !== 'open') {
                log('info', `Skipping board ${board_name}: Status is "${status}" (not "open")`);
                continue;
            }
            const startDate = dayjs(start_date);
            const endDate = dayjs(end_date);
            if (!startDate.isValid() || !endDate.isValid()) {
                log('error', `Invalid date format in config (ID: ${id}) for ${board_name}: start_date=${start_date}, end_date=${end_date}`);
                continue;
            }
            if (today.isBefore(startDate) || today.isAfter(endDate)) {
                log('info', `Skipping board ${board_name}: Today (${today.format('YYYY-MM-DD')}) is not between ${start_date} and ${end_date}`);
                continue;
            }

            // Check if check_interval has elapsed since last log
            if (check_interval) {
                try {
                    const intervalMs = parseCheckInterval(check_interval);
                    if (intervalMs === null) {
                        log('error', `Skipping board ${board_name}: Invalid check_interval ${check_interval}`);
                        continue;
                    }
                    const query = `
                        SELECT reg_datetime
                        FROM km_job_log
                        WHERE req_id = ?
                        ORDER BY reg_datetime DESC
                        LIMIT 1
                    `;
                    const [rows] = await db.query(query, [id]);
                    if (rows.length > 0) {
                        const lastRun = dayjs(rows[0].reg_datetime);
                        const nextRun = lastRun.add(intervalMs, 'millisecond');
                        if (today.isBefore(nextRun)) {
                            log('info', `Skipping board ${board_name}: check_interval (${check_interval}) not elapsed. Next run after ${nextRun.format('YYYY-MM-DD HH:mm:ss')}`);
                            continue;
                        }
                    }
                } catch (error) {
                    log('error', `Error checking last run for req_id ${id}: ${error.message}`);
                    continue;
                }
            }

            log('info', `Processing board ${board_name}: Status is "open" and today (${today.format('YYYY-MM-DD')}) is between ${start_date} and ${end_date}`);
            const normalizedKeywords = keywords.map(k => k.toLowerCase().replace(/\s+/g, ' '));
            log('info', `keywords=${normalizedKeywords.join(', ')}`);
            try {
                await fetchBoard({ ...config, keywords: normalizedKeywords });
            } catch (error) {
                log('error', `Error processing board ${board_name}: ${error.message}`);
            }
        }

        // checkBoards 실행 후 km_finder_run에 로그 추가/업데이트
        await logToFinderRun();
    }
    try {
        await checkBoards();
        log('info', `Setting interval with JOB_INTERVAL=${JOB_INTERVAL}`);
        setInterval(checkBoards, JOB_INTERVAL);
    } catch (error) {
        log('error', `Error in checkBoards: ${error.message}`);
    }
}

// 실행
main().catch((error) => log('error', `Main error: ${error.message}`));