//require('dotenv').config();
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// NODE_ENV에 따라 적절한 .env 파일 로드
const env = process.env.NODE_ENV || 'dev';
const envPath = path.resolve(__dirname, `.env.${env}`);

// 해당 환경 파일이 존재하면 로딩
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Loaded .env.${env}`);
} else {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
    console.log(`⚠️ .env.${env} not found. Loaded default .env`);
}

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
    CHECK_INTERVAL,
    RETRY_ATTEMPTS,
    RETRY_DELAY,
    SCREENSHOT_DIR,
    MAX_SCREENSHOTS
} = require('./modules/util.lib');

// 스텔스 플러그인 등록
puppeteer.use(StealthPlugin());

// 환경 변수 로드
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;
const SMTP_SERVER = process.env.SMTP_SERVER;
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10);

// Database connection pool setup for MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 설정
const RESET_SEEN_POSTS = false; // 디버깅용: true로 설정 시 seen_posts 초기화
const MAX_KEYWORDS = 10; // 최대 키워드 수 제한

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
                req_status AS status,
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
            const receiver_email = sanitizeString(row.receiver_email);
            const url = sanitizeString(row.url);
            const parsing_type = sanitizeString(row.parsing_type);
            const req_mb_id = sanitizeString(row.req_mb_id);

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
                parsing_config: parsingConfig,
                parsing_type,
                req_mb_id
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
async function checkDuplicatePost(config, detectedTitle, timeWindowMinutes = 10) {
    let connection;
    try {
        connection = await db.getConnection();
        const checkQuery = `
            SELECT detect_id
            FROM km_detect
            WHERE req_id = ?
            AND post_url = ?
            AND post_title = ?
            AND detect_datetime >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
            LIMIT 1
        `;
        const checkValues = [
            config.id,
            config.url,
            detectedTitle,
            timeWindowMinutes
        ];
        const [existing] = await connection.query(checkQuery, checkValues);
        if (existing.length > 0) {
            log('info', `Duplicate found for req_id=${config.id}, post_url=${config.url}, post_title=${detectedTitle} within last ${timeWindowMinutes} minutes`);
            return { isDuplicate: true, id: existing[0].detect_id };
        }
        return { isDuplicate: false };
    } catch (error) {
        log('error', `Error in checkDuplicatePost: ${error.message}`);
        throw error;
    } finally {
        if (connection) connection.release();
    }
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
            ) VALUES (?, ?, ?, ?, ?, NOW(), ?,  '1')
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

// OCR 실행
async function runOCR(imagePath) {
    log('info', '🔍 Running OCR...');
    const { data: { text } } = await Tesseract.recognize(imagePath, 'kor+eng');
    return text;
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
// Function to extract plain text from <article> element for FMKorea
function extractContent($, post, board_type) {
    if (board_type !== 'fmkorea') {
        return null; // Only process for fmkorea board_type
    }
    const article = $(post).find('article').html();
    if (!article) {
        log('warning', 'No <article> element found in post');
        return null;
    }
    // Load article content into Cheerio and extract text, removing all tags
    const $article = cheerio.load(article);
    const text = $article('article').text().replace(/\s+/g, ' ').trim(); // Normalize whitespace
    return text || null;
}

// Main crawling function
async function crawlWithPuppeteer(config) {
    const { url, keywords, board_type, board_name, parsing_config, receiver_email, receiver_name } = config;
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
                    let postContent = extractContent($, post, board_type); // Extract content for FMKorea
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
                                        content: postContent 
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
                                    content: postContent 
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

    // Duplicate check and insertion
    const nonDuplicatePosts = [];
    if (allPostsToNotify.length > 0) {
        for (const post of allPostsToNotify) {
            const duplicateCheck = await checkDuplicatePost(config, post.title);
            if (!duplicateCheck.isDuplicate) {
                await insertNotificationData(config, post);
                nonDuplicatePosts.push(post);
            }
        }
        // Send email only if there are non-duplicate posts
        if (nonDuplicatePosts.length > 0) {
            // await sendEmail({
            //     subject: `[알림] ${board_name} 키워드 "${keywords.join(', ')}" 관련 최근 게시물`,
            //     posts: nonDuplicatePosts,
            //     receiverEmail: receiver_email,
            //     receiverName: receiver_name,
            // });
        } else {
            log('info', 'No new posts to notify after duplicate check.');
        }
    }

    log('debug', `Fetched ${allResults.length} posts from ${url} for keywords ${keywords.join(', ')}: ${JSON.stringify(allResults)}`);
    return allResults;
}

// 게시판 파싱 (텍스트 또는 OCR)
async function fetchBoard(config) {
    const { url, keywords, board_type, board_name, parsing_config, receiver_email, receiver_name } = config;
    log('info', `>>>> ${board_name} ${board_type} ${keywords.join(', ')}`);
    const modifiedUrl = url.replace(/\$keyword/i, encodeURIComponent(keywords[0]));
    log('info', `🌐 Fetching board: ${modifiedUrl}`);
    const parsingType = parsing_config.parsing_type || 'text';
    if (parsingType === 'ocr') {
        await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
        const screenshotPath = path.join(SCREENSHOT_DIR, `${Date.now()}_page.png`);
        log('info', '📸 Taking screenshot...');
        await captureScreenshot(modifiedUrl, screenshotPath);
        log('info', '🔍 Running OCR...');
        const ocrText = await runOCR(screenshotPath);
        log('debug', '📄 Extracted Text:\n' + ocrText);
        const lines = ocrText
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        const result = [];
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
                                postsToNotify.push({ title: line, link, date: postDate.format('YYYY-MM-DD'), keyword });
                            } else {
                                log('info', `⏳ 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글 아님 (keyword: ${keyword})`);
                            }
                        } else {
                            log('info', `📅 작성일 정보를 찾을 수 없음 (keyword: ${keyword})`);
                            postsToNotify.push({ title: line, link, date: null, keyword });
                        }
                        break;
                    }
                }
            });

            // 중복 체크 및 삽입
            const nonDuplicatePosts = [];
            if (postsToNotify.length > 0) {
                for (const post of postsToNotify) {
                    const duplicateCheck = await checkDuplicatePost(config, post.title);
                    if (!duplicateCheck.isDuplicate) {
                        await insertNotificationData(config, post);
                        nonDuplicatePosts.push(post);
                    }
                }
                // 중복되지 않은 게시물이 있을 경우에만 이메일 발송
                if (nonDuplicatePosts.length > 0) {
                    // await sendEmail({
                    //     subject: `[알림] 키워드 "${keywords.join(', ')}" 관련 최근 게시물`,
                    //     posts: nonDuplicatePosts,
                    //     receiverEmail: receiver_email,
                    //     receiverName: receiver_name,
                    // });
                } else {
                    log('info', 'No new posts to notify after duplicate check.');
                }
            }
        } else {
            log('info', `\n❌ 키워드 "${keywords.join(', ')}"가 감지되지 않았습니다.`);
        }
        log('debug', `Fetched ${result.length} posts from ${modifiedUrl} for keywords ${keywords.join(', ')}: ${JSON.stringify(result)}`);
        return result;
    } else {
        return await crawlWithPuppeteer(config);
    }
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
            const { id, receiver_name, receiver_email, url, keywords, board_type, board_name, status, start_date, end_date, parsing_config } = config;
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
            log('info', `Processing board ${board_name}: Status is "open" and today (${today.format('YYYY-MM-DD')}) is between ${start_date} and ${end_date}`);
            const normalizedKeywords = keywords.map(k => k.toLowerCase().replace(/\s+/g, ' '));
            log('info', `keywords=${normalizedKeywords.join(', ')}`);
            await fetchBoard({ ...config, keywords: normalizedKeywords });
        }
    }
    await checkBoards();
    setInterval(checkBoards, CHECK_INTERVAL);
}

// 실행
main().catch((error) => log('error', `Main error: ${error.message}`));