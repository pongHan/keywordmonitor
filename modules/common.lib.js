const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const dayjs = require('dayjs');

// 스텔스 플러그인 등록
puppeteer.use(StealthPlugin());

// 상수 정의
const CHECK_INTERVAL = 60 * 1000; // 60초 (ms)
const RETRY_ATTEMPTS = 3; // 재시도 횟수
const RETRY_DELAY = 5000; // 재시도 간 딜레이 (ms)
const SCREENSHOT_DIR = 'screenshots';
const MAX_SCREENSHOTS = 10; // 유지할 최대 스크린샷 파일 수

const LOG_DIR = 'logs';
const LOG_RETENTION_MS = 24 * 60 * 60 * 1000; // 24시간

let currentLogFile = null;
let lastHour = null;

// 로그 파일 생성 및 관리
const initializeLogFile = async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hour = String(now.getUTCHours() + 9).padStart(2, '0'); // KST (UTC+9)
    const logFileName = `log${year}${month}${day}${hour}.txt`;
    const logFilePath = path.join(LOG_DIR, logFileName);

    if (lastHour !== hour) {
        currentLogFile = logFilePath;
        lastHour = hour;
        await fs.mkdir(LOG_DIR, { recursive: true });
        // 24시간 이전 파일 삭제
        const files = await fs.readdir(LOG_DIR);
        const cutoffTime = now.getTime() - LOG_RETENTION_MS;
        for (const file of files) {
            const filePath = path.join(LOG_DIR, file);
            const stats = await fs.stat(filePath);
            if (stats.mtimeMs < cutoffTime) {
                await fs.unlink(filePath);
                console.log(`Deleted old log file: ${filePath}`);
            }
        }
    }

    return currentLogFile;
};

// 로그 함수
const log = async (level, message) => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${level.toUpperCase()} - ${message}\n`;
    console.log(logLine.trim());

    const logFile = await initializeLogFile();
    await fs.appendFile(logFile, logLine, 'utf8');
};


const sanitizeString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') return String(value).trim();
    try {
        return Buffer.from(value, 'utf8').toString('utf8').trim();
    } catch (e) {
        log('warning', `Invalid UTF-8 in string: "${value}"`);
        return value.replace(/[^\x00-\x7F가-힣\s]/g, '').trim();
    }
};

// 날짜 파싱
const parseDate = (dateStr) => {
    const dateMatch = dateStr.match(/(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{2})|(\d{8})|(\d{6})/);
    if (dateMatch) {
        let matchedDate = dateMatch[0];
        let formattedDate;
        if (matchedDate.match(/\d{4}[-/]\d{2}[-/]\d{2}/)) formattedDate = matchedDate.replace(/\//g, '-');
        else if (matchedDate.match(/\d{2}[-/]\d{2}[-/]\d{2}/)) formattedDate = `20${matchedDate}`.replace(/\//g, '-');
        else if (matchedDate.match(/\d{8}/)) formattedDate = `${matchedDate.substring(0,4)}-${matchedDate.substring(4,6)}-${matchedDate.substring(6,8)}`;
        else if (matchedDate.match(/\d{6}/)) formattedDate = `20${matchedDate.substring(0,2)}-${matchedDate.substring(2,4)}-${matchedDate.substring(4,6)}`;
        return formattedDate;
    }
    return null;
};

// FMKorea 상대적 시간 파싱
const parseRelativeTime = (relativeTime, absoluteTimeComment, today) => {
    log('debug', `Parsing relative time: ${relativeTime}, Absolute time comment raw: ${absoluteTimeComment}`);
    const absoluteDateMatch = relativeTime.match(/\d{4}-\d{2}-\d{2}/);
    if (absoluteDateMatch) {
        const formattedDate = parseDate(absoluteDateMatch[0]);
        if (formattedDate) return dayjs(formattedDate);
    }
    let absoluteTime = null;
    if (absoluteTimeComment && typeof absoluteTimeComment === 'string') {
        const timeMatch = absoluteTimeComment.match(/<!--\s*(\d{2}:\d{2})\s*-->/);
        if (timeMatch && timeMatch[1]) absoluteTime = timeMatch[1];
        else log('warning', `Failed to parse absoluteTimeComment: ${absoluteTimeComment}`);
    } else log('warning', `Invalid absoluteTimeComment type or value: ${absoluteTimeComment}`);
    let postDate;
    if (relativeTime.includes('분 전')) postDate = today.subtract(parseInt(relativeTime.match(/\d+/)[0], 10), 'minute');
    else if (relativeTime.includes('시간 전')) postDate = today.subtract(parseInt(relativeTime.match(/\d+/)[0], 10), 'hour');
    else if (relativeTime.includes('일 전')) postDate = today.subtract(parseInt(relativeTime.match(/\d+/)[0], 10), 'day');
    else { log('warning', `Unsupported relative time format: ${relativeTime}`); return null; }
    if (absoluteTime) {
        const [hours, minutes] = absoluteTime.split(':').map(num => parseInt(num, 10));
        postDate = postDate.set('hour', hours).set('minute', minutes);
        log('debug', `Applied absolute time ${absoluteTime} to postDate: ${postDate.format('YYYY-MM-DD HH:mm')}`);
    }
    return postDate;
};

// 날짜 추출
const extractDate = ($, post, dateConfig, boardType, today) => {
    let postDate = null;
    if (boardType === 'fmkorea') {
        const dateElement = $(post).find('span.regdate');
        if (dateElement.length) {
            const relativeTime = dateElement.text().trim();
            let absoluteTimeComment = dateElement.html().match(/<!--\s*(\d{2}:\d{2})\s*-->/);
            absoluteTimeComment = absoluteTimeComment ? absoluteTimeComment[0] : '';
            log('debug', `Extracted HTML for date: ${dateElement.html()}`);
            postDate = parseRelativeTime(relativeTime, absoluteTimeComment, today);
            log('debug', `Parsed FMKorea date: ${postDate ? postDate.format('YYYY-MM-DD HH:mm') : 'null'}`);
        } else {
            const altDateElement = $(post).find('div').text();
            const altDateMatch = altDateElement.match(/\d{4}-\d{2}-\d{2}/);
            if (altDateMatch) { const formattedDate = parseDate(altDateMatch[0]); if (formattedDate) { postDate = dayjs(formattedDate); log('debug', `Parsed alternative date: ${postDate.format('YYYY-MM-DD')}`); } }
        }
    } else if (dateConfig) {
        let dateSelector = `${dateConfig.tag}`;
        if (dateConfig.class) dateSelector += `.${dateConfig.class}`;
        const dateElement = $(post).find(dateSelector);
        if (dateElement.length) {
            const postDateRaw = dateElement.text().trim();
            log('debug', `Processing date: ${postDateRaw}`);
            const formattedDate = parseDate(postDateRaw);
            if (formattedDate) postDate = dayjs(formattedDate);
        }
    }
    return postDate;
};

// 링크 추출
const extractLink = ($, post, linkConfig, boardUrl, titleText) => {
    let link = null;
    if (linkConfig === 'date_based') {
        const dateConfig = linkConfig.date || {};
        let dateSelector = `${dateConfig.tag}`;
        if (dateConfig.class) dateSelector += `.${dateConfig.class}`;
        if (dateConfig.index !== undefined) {
            const dateElement = $(post).find('td').eq(dateConfig.index);
            if (dateElement.length) { const postDateRaw = dateElement.text().trim(); log('debug', `Raw date text: ${postDateRaw}`); link = `${boardUrl}#${postDateRaw.replace(/\//g, '-')}`; }
        } else if (dateConfig.color) {
            dateSelector += `[color="${dateConfig.color}"]`;
            const dateElement = $(post).find(dateSelector);
            if (dateElement.length) { const postDateRaw = dateElement.text().trim(); log('debug', `Raw date text: ${postDateRaw}`); link = `${boardUrl}#${postDateRaw.replace(/\//g, '-')}`; }
        }
    } else {
        let linkSelector = `${linkConfig.tag}`;
        if (linkConfig.href) { linkSelector = `${linkConfig.tag}[href]`; const linkElement = $(post).find(linkSelector).first(); if (linkElement.length) link = url.resolve(boardUrl, linkElement.attr('href')); }
        if (!link && titleText) link = `${boardUrl}#${titleText.slice(0, 10)}`;
    }
    return link ? sanitizeString(link) : null;
};

// 제목 추출
const extractTitle = ($, post, titleConfig, boardType) => {
    let titleText = null, titleElement = null;
    if (titleConfig.search_all) {
        const tds = $(post).find('td');
        tds.each((i, td) => { const text = $(td).text().trim(); if (text && text.length > 5) { titleText = text; titleElement = $(td); return false; } });
    } else {
        let titleSelector = `${titleConfig.tag}`;
        if (titleConfig.class) { titleSelector += `.${titleConfig.class}`; titleElement = $(post).find(titleSelector); }
        if (boardType === 'pgr21_humor' || boardType === 'fmkorea') { titleElement = titleElement.find('a'); titleText = titleElement.text().trim(); }
        else if (titleElement) titleText = titleElement.text().trim();
    }
    return titleText ? sanitizeString(titleText) : null;
};

// 컨테이너 셀렉터 생성
const generateSelector = (containerConfig) => {
    let selector = containerConfig.tag;
    if (containerConfig.id) selector += `#${containerConfig.id}`;
    else if (containerConfig.class) selector += `.${containerConfig.class}`;
    else if (containerConfig.style) selector = `${containerConfig.tag}[style*="${containerConfig.style}"]`;
    return selector;
};

// 화면 캡처
const captureScreenshot = async (url, outputPath) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await page.screenshot({ path: outputPath, fullPage: true });
        log('info', `Screenshot saved: ${outputPath}`);
        await cleanupScreenshots();
    } catch (e) {
        log('error', `Puppeteer navigation error: ${e.message}`);
    } finally {
        await browser.close();
    }
    return outputPath;
};

// 스크린샷 디렉토리 정리
const cleanupScreenshots = async () => {
    try {
        const files = await fs.readdir(SCREENSHOT_DIR);
        if (files.length <= MAX_SCREENSHOTS) {
            log('debug', `Screenshot count (${files.length}) is within limit (${MAX_SCREENSHOTS}). No cleanup needed.`);
            return;
        }

        const fileStats = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(SCREENSHOT_DIR, file);
                const stats = await fs.stat(filePath);
                return { filePath, ctime: stats.ctime };
            })
        );

        fileStats.sort((a, b) => b.ctime - a.ctime);

        const filesToDelete = fileStats.slice(MAX_SCREENSHOTS);
        for (const { filePath } of filesToDelete) {
            await fs.unlink(filePath);
            log('info', `Deleted old screenshot: ${filePath}`);
        }
        log('info', `Cleaned up screenshots. Kept ${MAX_SCREENSHOTS}, deleted ${filesToDelete.length}.`);
    } catch (error) {
        log('error', `Error cleaning up screenshots: ${error.message}`);
    }
};

module.exports = {
    log,
    sanitizeString,
    parseDate,
    parseRelativeTime,
    extractDate,
    extractLink,
    extractTitle,
    generateSelector,
    captureScreenshot,
    cleanupScreenshots,
    CHECK_INTERVAL,
    RETRY_ATTEMPTS,
    RETRY_DELAY,
    SCREENSHOT_DIR,
    MAX_SCREENSHOTS
};