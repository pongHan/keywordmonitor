// 모듈 불러오기
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const url = require('url');
const puppeteer = require('puppeteer');
const Tesseract = require('tesseract.js');
const path = require('path');

// 이메일 설정
const SENDER_EMAIL = 'your_email@gmail.com';
const SENDER_PASSWORD = 'your_app_password'; // Gmail 앱 비밀번호
const RECEIVER_EMAIL = 'receiver_email@example.com';
const SMTP_SERVER = 'smtp.gmail.com';
const SMTP_PORT = 587;

// 설정
const CONFIG_FILE = 'config.json';
const CHECK_INTERVAL = 60 * 1000; // 60초 (ms)
const RESET_SEEN_POSTS = false; // 디버깅용
const SCREENSHOT_DIR = 'screenshots';

// 로그 출력 함수
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
            log('error', '⚠️ config.json 파일을 찾을 수 없습니다.');
            return [];
        }
        log('error', `⚠️ JSON 파싱 에러: ${error.message}`);
        return [];
    }
}

// 화면 캡처
async function captureScreenshot(boardUrl, outputPath) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    await page.goto(boardUrl, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: outputPath, fullPage: true });
    await browser.close();
    return outputPath;
}

// OCR 실행
async function runOCR(imagePath) {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'kor+eng', {
        logger: m => log('info', m.status)
    });
    return text;
}

// 게시판 파싱
async function fetchBoard(boardUrl, parsingConfig) {
    const parsingType = parsingConfig.parsing_type || 'text';

    if (parsingType === 'ocr') {
        await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
        const screenshotPath = path.join(SCREENSHOT_DIR, `${Date.now()}_page.png`);
        log('info', '📸 스크린샷 캡처 중...');
        await captureScreenshot(boardUrl, screenshotPath);

        log('info', '🔍 OCR 분석 중...');
        const ocrText = await runOCR(screenshotPath);
        const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        const keyword = (parsingConfig.keyword || '').toLowerCase().replace(/\s+/g, ' ');
        const result = [];

        lines.forEach((line, index) => {
            const normalizedLine = line.toLowerCase().replace(/\s+/g, ' ');
            if (normalizedLine.includes(keyword)) {
                const link = `${boardUrl}#line_${index}`;
                result.push({ title: line, link });
            }
        });

        return result;
    } else {
        try {
            const response = await axios.get(boardUrl, { timeout: 10000 });
            const $ = cheerio.load(response.data);

            const containerConfig = parsingConfig.container || {};
            let containerSelector = containerConfig.tag;
            if (containerConfig.id) {
                containerSelector += `#${containerConfig.id}`;
            } else if (containerConfig.class) {
                containerSelector += `.${containerConfig.class}`;
            } else if (containerConfig.style) {
                containerSelector = `${containerConfig.tag}[style*="${containerConfig.style}"]`;
            }

            const posts = $(containerSelector);
            const result = [];

            posts.each((_, post) => {
                const titleConfig = parsingConfig.title || {};
                let titleElement = null, titleText = null;

                if (titleConfig.search_all) {
                    $(post).find('td').each((_, td) => {
                        const text = $(td).text().trim();
                        if (text.length > 5) {
                            titleText = text;
                            return false;
                        }
                    });
                } else {
                    let titleSelector = titleConfig.tag;
                    if (titleConfig.class) {
                        titleSelector += `.${titleConfig.class}`;
                    } else if (titleConfig.style) {
                        titleSelector += `[style*="${titleConfig.style}"]`;
                    } else if (titleConfig.size) {
                        titleSelector += `[size="${titleConfig.size}"]`;
                    }
                    titleElement = $(post).find(titleSelector);
                    if (titleConfig.index !== undefined) {
                        titleElement = $(post).find('td').eq(titleConfig.index);
                    }
                    titleText = titleElement.text().trim();
                }

                let link = null;
                const linkConfig = parsingConfig.link || {};
                if (linkConfig.href) {
                    const linkElement = $(post).find(`${linkConfig.tag}[href]`);
                    if (linkElement.length) {
                        link = url.resolve(boardUrl, linkElement.attr('href'));
                    }
                } else if (linkConfig.onclick) {
                    const linkElement = $(post).find(`${linkConfig.tag}[onclick*="${linkConfig.onclick}"]`);
                    if (linkElement.length) {
                        const onclick = linkElement.attr('onclick');
                        const match = onclick.match(/'(http[^']+)'/);
                        link = match ? match[1] : null;
                    }
                } else if (parsingConfig.link === 'date_based') {
                    const dateConfig = parsingConfig.date || {};
                    const dateText = $(post).find('td').eq(dateConfig.index).text().trim();
                    link = `${boardUrl}#${dateText.replace(/\//g, '-')}`;
                }

                if (titleText && link) {
                    titleText = titleText.replace(/\s+/g, ' ');
                    result.push({ title: titleText, link });
                }
            });

            return result;
        } catch (error) {
            log('error', `❌ 게시판 로딩 오류: ${boardUrl}, ${error.message}`);
            return [];
        }
    }
}

// 이메일 전송
async function sendEmail(subject, body) {
    const transporter = nodemailer.createTransport({
        host: SMTP_SERVER,
        port: SMTP_PORT,
        secure: false,
        auth: {
            user: SENDER_EMAIL,
            pass: SENDER_PASSWORD,
        },
    });

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: RECEIVER_EMAIL,
            subject,
            text: body,
        });
        log('info', `📧 이메일 전송됨: ${subject}`);
    } catch (error) {
        log('error', `❌ 이메일 전송 실패: ${error.message}`);
    }
}

// 메인 루프
async function main() {
    let seenPosts = new Set();
    if (RESET_SEEN_POSTS) {
        seenPosts.clear();
        log('info', '🧹 seenPosts 초기화됨');
    }

    async function checkBoards() {
        const config = await loadConfig();
        for (const entry of config) {
            const { url, keyword, parsing_config, board_type, board_name } = entry;
            if (!url || !keyword || !parsing_config || !board_name) {
                log('error', `잘못된 config 항목: ${JSON.stringify(entry)}`);
                continue;
            }

            parsing_config.keyword = keyword;
            parsing_config.board_type = board_type;

            const posts = await fetchBoard(url, parsing_config);
            for (const { title, link } of posts) {
                const normalizedTitle = title.toLowerCase().replace(/\s+/g, ' ');
                const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, ' ');
                if (normalizedTitle.includes(normalizedKeyword) && !seenPosts.has(link)) {
                    const subject = `키워드 탐지 - ${board_name} : ${keyword} - ${title}`;
                    await sendEmail(subject, `Title: ${title}\nLink: ${link}`);
                    seenPosts.add(link);
                } else if (seenPosts.has(link)) {
                    log('debug', `👀 이미 본 글: ${title}`);
                } else {
                    log('debug', `🔍 키워드 미포함: ${title}`);
                }
            }
        }
    }

    await checkBoards();
    setInterval(checkBoards, CHECK_INTERVAL);
}

// 실행
main().catch(error => log('error', `❌ main 함수 오류: ${error.message}`));
