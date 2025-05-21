require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const url = require('url');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Tesseract = require('tesseract.js');
const path = require('path');
const dayjs = require('dayjs');

// 스텔스 플러그인 등록
puppeteer.use(StealthPlugin());

// 환경 변수 로드
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;
const SMTP_SERVER = process.env.SMTP_SERVER;
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10);

// 설정
const CONFIG_FILE = 'config.json';
const CHECK_INTERVAL = 60 * 1000; // 60초 (ms)
const RESET_SEEN_POSTS = false; // 디버깅용: true로 설정 시 seen_posts 초기화
const SCREENSHOT_DIR = 'screenshots';
const MAX_SCREENSHOTS = 10; // 유지할 최대 스크린샷 파일 수
const RETRY_ATTEMPTS = 3; // 430 에러 발생 시 재시도 횟수
const RETRY_DELAY = 5000; // 재시도 간 딜레이 (ms)



// 로깅 설정
const log = (level, message) => {
    console.log(`[${new Date().toISOString()}] ${level.toUpperCase()} - ${message}`);
};

// 설정 파일 로드
async function loadConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            log('error', 'config.json file not found.');
            return [];
        }
        log('error', `Error parsing JSON: ${error.message}`);
        return [];
    }
}

// 스크린샷 디렉토리 정리 함수
async function cleanupScreenshots() {
    try {
        // 스크린샷 디렉토리의 파일 목록 읽기
        const files = await fs.readdir(SCREENSHOT_DIR);
        if (files.length <= MAX_SCREENSHOTS) {
            log('debug', `Screenshot count (${files.length}) is within limit (${MAX_SCREENSHOTS}). No cleanup needed.`);
            return;
        }

        // 파일 정보와 함께 목록 생성
        const fileStats = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(SCREENSHOT_DIR, file);
                const stats = await fs.stat(filePath);
                return { filePath, ctime: stats.ctime };
            })
        );

        // 생성 시간 기준으로 내림차순 정렬 (최신 파일이 먼저)
        fileStats.sort((a, b) => b.ctime - a.ctime);

        // 최근 10개 파일 제외한 나머지 삭제
        const filesToDelete = fileStats.slice(MAX_SCREENSHOTS);
        for (const { filePath } of filesToDelete) {
            await fs.unlink(filePath);
            log('info', `Deleted old screenshot: ${filePath}`);
        }
        log('info', `Cleaned up screenshots. Kept ${MAX_SCREENSHOTS}, deleted ${filesToDelete.length}.`);
    } catch (error) {
        log('error', `Error cleaning up screenshots: ${error.message}`);
    }
}

// 화면 캡처
async function captureScreenshot(url, outputPath) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
 
      
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
        await page.screenshot({ path: outputPath, fullPage: true });
        log('info', `Screenshot saved: ${outputPath}`);

        // 스크린샷 디렉토리 정리
        await cleanupScreenshots();
    } catch (e) {
        log('error', `Puppeteer navigation error: ${e.message}`);
    } finally {
        await browser.close();
    }
    return outputPath;
}

// OCR 실행
async function runOCR(imagePath) {
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

    // HTML 테이블 생성
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


function generateSelector(containerConfig) {
    let selector = containerConfig.tag;
    if (containerConfig.id) {
        selector += `#${containerConfig.id}`;
    } else if (containerConfig.class) {
        selector += `.${containerConfig.class}`;
    } else if (containerConfig.style) {
        selector = `${containerConfig.tag}[style*="${containerConfig.style}"]`;
    }
    return selector;
}

// 제목 추출
function extractTitle($, post, titleConfig, boardType) {
    let titleText = null;
    let titleElement = null;

    if (titleConfig.search_all) {
        const tds = $(post).find('td');
        tds.each((i, td) => {
            const text = $(td).text().trim();
            if (text && text.length > 5) {
                titleText = text;
                titleElement = $(td);
                return false;
            }
        });
    } else {
        let titleSelector = `${titleConfig.tag}`;
        if (titleConfig.class) {
            titleSelector += `.${titleConfig.class}`;
            titleElement = $(post).find(titleSelector);
        }
        if (boardType === 'pgr21_humor' || boardType === 'fmkorea') {
            titleElement = titleElement.find('a');
            titleText = titleElement.text().trim();
        } else if (titleElement) {
            titleText = titleElement.text().trim();
        }
    }
    return titleText;
}

// 링크 추출
function extractLink($, post, linkConfig, boardUrl, titleText) {
    let link = null;

    if (linkConfig === 'date_based') {
        const dateConfig = parsingConfig.date || {};
        let dateSelector = `${dateConfig.tag}`;
        if (dateConfig.class) {
            dateSelector += `.${dateConfig.class}`;
        }
        if (dateConfig.index !== undefined) {
            const dateElement = $(post).find('td').eq(dateConfig.index);
            if (dateElement.length) {
                const postDateRaw = dateElement.text().trim();
                log('debug', `Raw date text: ${postDateRaw}`);
                link = `${boardUrl}#${postDateRaw.replace(/\//g, '-')}`;
            }
        } else if (dateConfig.color) {
            dateSelector += `[color="${dateConfig.color}"]`;
            const dateElement = $(post).find(dateSelector);
            if (dateElement.length) {
                const postDateRaw = dateElement.text().trim();
                log('debug', `Raw date text: ${postDateRaw}`);
                link = `${boardUrl}#${postDateRaw.replace(/\//g, '-')}`;
            }
        }
    } else {
        let linkSelector = `${linkConfig.tag}`;
        if (linkConfig.href) {
            linkSelector = `${linkConfig.tag}[href]`;
            const linkElement = $(post).find(linkSelector).first();
            if (linkElement.length) {
                link = url.resolve(boardUrl, linkElement.attr('href'));
            }
        }
        if (!link && titleText) {
            link = `${boardUrl}#${titleText.slice(0, 10)}`;
        }
    }
    return link;
}

// 날짜 추출
// 날짜 추출
function extractDate($, post, dateConfig, boardType, today) {
    let postDate = null;

    if (boardType === 'fmkorea') {
        const dateElement = $(post).find('span.regdate');
        if (dateElement.length) {
            const relativeTime = dateElement.text().trim();
            let absoluteTimeComment = dateElement.html().match(/<!--\s*(\d{2}:\d{2})\s*-->/); // 배열 반환
            absoluteTimeComment = absoluteTimeComment ? absoluteTimeComment[0] : ''; // 첫 번째 매칭 결과 또는 빈 문자열
            //log('debug', `Extracted HTML for date: ${dateElement.html()}`);
            postDate = parseRelativeTime(relativeTime, absoluteTimeComment, today);
            //log('debug', `Parsed FMKorea date: ${postDate ? postDate.format('YYYY-MM-DD HH:mm') : 'null'}`);
        } else {
            const altDateElement = $(post).find('div').text();
            const altDateMatch = altDateElement.match(/\d{4}-\d{2}-\d{2}/);
            if (altDateMatch) {
                const formattedDate = parseDate(altDateMatch[0]);
                if (formattedDate) {
                    postDate = dayjs(formattedDate);
                    //log('debug', `Parsed alternative date: ${postDate.format('YYYY-MM-DD')}`);
                }
            }
        }
    } else if (dateConfig) {
        let dateSelector = `${dateConfig.tag}`;
        if (dateConfig.class) {
            dateSelector += `.${dateConfig.class}`;
        }
        const dateElement = $(post).find(dateSelector);
        if (dateElement.length) {
            const postDateRaw = dateElement.text().trim();
            log('debug', `Processing date: ${postDateRaw}`);
            const formattedDate = parseDate(postDateRaw);
            if (formattedDate) {
                postDate = dayjs(formattedDate);
            }
        }
    }
    return postDate;
}

// FMKorea 상대적 시간 파싱 함수
// FMKorea 상대적 시간 파싱 함수
function parseRelativeTime(relativeTime, absoluteTimeComment, today) {
    log('debug', `Parsing relative time: ${relativeTime}, Absolute time comment raw: ${absoluteTimeComment}`);

    const absoluteDateMatch = relativeTime.match(/\d{4}-\d{2}-\d{2}/);
    if (absoluteDateMatch) {
        const formattedDate = parseDate(absoluteDateMatch[0]);
        if (formattedDate) {
            return dayjs(formattedDate);
        }
    }

    let absoluteTime = null;
    if (absoluteTimeComment && typeof absoluteTimeComment === 'string') {
        const timeMatch = absoluteTimeComment.match(/<!--\s*(\d{2}:\d{2})\s*-->/); // 기존 정규 표현식
        if (timeMatch && timeMatch[1]) {
            absoluteTime = timeMatch[1];
            log('debug', `Extracted absolute time: ${absoluteTime}`);
        } else {
            log('warning', `Failed to parse absoluteTimeComment: ${absoluteTimeComment}`);
        }
    } else {
        log('warning', `Invalid absoluteTimeComment type or value: ${absoluteTimeComment}`);
    }

    let postDate;
    if (relativeTime.includes('분 전')) {
        const minutes = parseInt(relativeTime.match(/\d+/)[0], 10);
        postDate = today.subtract(minutes, 'minute');
    } else if (relativeTime.includes('시간 전')) {
        const hours = parseInt(relativeTime.match(/\d+/)[0], 10);
        postDate = today.subtract(hours, 'hour');
    } else if (relativeTime.includes('일 전')) {
        const days = parseInt(relativeTime.match(/\d+/)[0], 10);
        postDate = today.subtract(days, 'day');
    } else {
        log('warning', `Unsupported relative time format: ${relativeTime}`);
        return null;
    }

    if (absoluteTime) {
        const [hours, minutes] = absoluteTime.split(':').map(num => parseInt(num, 10));
        postDate = postDate.set('hour', hours).set('minute', minutes);
        log('debug', `Applied absolute time ${absoluteTime} to postDate: ${postDate.format('YYYY-MM-DD HH:mm')}`);
    }

    return postDate;
}

// 날짜 파싱 및 변환 함수
function parseDate(dateStr) {
    const dateMatch = dateStr.match(
        /(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{2})|(\d{8})|(\d{6})/
    );
    if (dateMatch) {
        let matchedDate = dateMatch[0];
        let formattedDate;

        if (matchedDate.match(/\d{4}[-/]\d{2}[-/]\d{2}/)) {
            formattedDate = matchedDate.replace(/\//g, '-');
        } else if (matchedDate.match(/\d{2}[-/]\d{2}[-/]\d{2}/)) {
            formattedDate = `20${matchedDate}`.replace(/\//g, '-');
        } else if (matchedDate.match(/\d{8}/)) {
            formattedDate = `${matchedDate.substring(0, 4)}-${matchedDate.substring(4, 6)}-${matchedDate.substring(6, 8)}`;
        } else if (matchedDate.match(/\d{6}/)) {
            formattedDate = `20${matchedDate.substring(0, 2)}-${matchedDate.substring(2, 4)}-${matchedDate.substring(4, 6)}`;
        }

        return formattedDate;
    }
    return null;
}


// 게시판 파싱 (텍스트 또는 OCR)
// Puppeteer로 크롤링
async function crawlWithPuppeteer(config) {
    const { url, keyword, board_type, board_name, parsing_config, receiver_email, receiver_name } = config;

    // config.url에서 $keyword를 실제 keyword로 치환
    const modifiedUrl = url.replace('$keyword', encodeURIComponent(keyword));
    
    const RETRY_ATTEMPTS = 3;
    const RETRY_DELAY = 3000;
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
                log('info', 'title='+titleText);

                let link = extractLink($, post, parsing_config.link, modifiedUrl, titleText);
                let postDate = extractDate($, post, parsing_config.date, board_type, today);

                if (titleText && link) {
                    titleText = titleText.replace(/\s+/g, ' ');
                    const normalizedTitle = titleText.toLowerCase();
                    if (normalizedTitle.includes(keyword)) {
                        result.push({ title: titleText, link });
                        if (postDate) {
                            const diff = today.diff(postDate, 'day');
                            if (diff <= 2) {
                                log('info', `📬 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글이므로 메일 발송`);
                                postsToNotify.push({ title: titleText, link, date: postDate.format('YYYY-MM-DD') });
                            } else {
                                log('info', `⏳ 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글 아님`);
                            }
                        } else {
                            log('info', `📅 작성일 정보를 찾을 수 없음`);
                            postsToNotify.push({ title: titleText, link, date: null });
                        }
                    }
                } else {
                    log('warning', `Missing title or link in post at ${modifiedUrl}`);
                }
            });

            if (postsToNotify.length > 0) {
                await sendEmail({
                    subject: `[알림] 키워드 "${keyword}" 관련 최근 게시물`,
                    posts: postsToNotify,
                    receiverEmail: receiver_email,
                    receiverName: receiver_name,
                });
            }

            log('debug', `Fetched ${result.length} posts from ${modifiedUrl}: ${JSON.stringify(result)}`);
            return result;

        } catch (error) {
            attempt++;
            log('warning', `Puppeteer error on attempt ${attempt}: ${error.message}`);
            if (attempt < RETRY_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                continue;
            } else {
                log('error', `Failed to crawl ${modifiedUrl} after ${RETRY_ATTEMPTS} attempts: ${error.message}`);
                return [];
            }
        }
    }
}

// 게시판 파싱 (텍스트 또는 OCR)
async function fetchBoard(config) {
    const { url, keyword, board_type, board_name, parsing_config, receiver_email, receiver_name } = config;

    log('info', 'fetchBoard: keyword='+keyword);
    // config.url에서 $keyword를 실제 keyword로 치환 (대소문자 구분 없이)
    const modifiedUrl = url.replace(/\$keyword/i, encodeURIComponent(keyword));

    log('info', `fetchBoard: modifiedUrl=${modifiedUrl}`);
    log('info', `🌐 Fetching board: ${modifiedUrl}, Keyword: ${keyword}, Board Type: ${board_type}`);
    //log('debug', `Parsing Config: ${JSON.stringify(parsing_config, null, 2)}`);

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
            log('info', `\n🔎 키워드 "${keyword}" 감지 결과:`);

            lines.forEach((line, index) => {
                const normalizedLine = line.toLowerCase().replace(/\s+/g, ' ');
                if (keyword && normalizedLine.includes(keyword)) {
                    const link = `${modifiedUrl}#line_${index}`;
                    result.push({ title: line, link });

                    log('info', `${index + 1}. ${line} (Link: ${link})`);

                    const formattedDate = parseDate(line);
                    if (formattedDate) {
                        const postDate = dayjs(formattedDate);
                        const today = dayjs();
                        const diff = today.diff(postDate, 'day');

                        if (diff <= 2) {
                            log('info', `📬 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글이므로 메일 발송`);
                            postsToNotify.push({ title: line, link, date: postDate.format('YYYY-MM-DD') });
                        } else {
                            log('info', `⏳ 작성일 ${postDate.format('YYYY-MM-DD')} => 최근 글 아님`);
                        }
                    } else {
                        log('info', `📅 작성일 정보를 찾을 수 없음`);
                        postsToNotify.push({ title: line, link, date: null });
                    }
                }
            });

            if (postsToNotify.length > 0) {
                await sendEmail({
                    subject: `[알림] 키워드 "${keyword}" 관련 최근 게시물`,
                    posts: postsToNotify,
                    receiverEmail: receiver_email,
                    receiverName: receiver_name,
                });
            }
        } else {
            log('info', `\n❌ 키워드 "${keyword}"가 감지되지 않았습니다.`);
        }

        log('debug', `Fetched ${result.length} posts from ${modifiedUrl}: ${JSON.stringify(result)}`);
        return result;
    } else {
        return await crawlWithPuppeteer(config);
    }
}

// 메인 함수
// 메인 함수
async function main() {
    let seenPosts = new Set();
    if (RESET_SEEN_POSTS) {
        seenPosts.clear();
        log('info', 'seenPosts cleared for debugging');
    }

    async function checkBoards() {
        const configs = await loadConfig();
        const today = dayjs();

        for (const config of configs) {
            const { id, receiver_name, receiver_email, url, keyword, board_type, board_name, status, start_date, end_date, parsing_config } = config;

            // 필수 필드 확인
            if (!receiver_name || !receiver_email || !url || !keyword || !board_type || !board_name || !status || !start_date || !end_date || !parsing_config) {
                log('error', `Invalid config entry (ID: ${id}): ${JSON.stringify(config)}`);
                continue;
            }

            // status 및 날짜 조건 확인
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
            const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, ' ');
            log('info', 'keyword='+ normalizedKeyword);
            const posts = await fetchBoard({ ...config, keyword: normalizedKeyword }, config);
        }
    }

    await checkBoards();
    setInterval(checkBoards, CHECK_INTERVAL);
}


// 실행
main().catch((error) => log('error', `Main error: ${error.message}`));