require('dotenv').config();
const puppeteer = require('puppeteer');
const tesseract = require('tesseract.js');
const nodemailer = require('nodemailer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = './screenshots';
const CONFIG_FILE = './config.json';

const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

async function sendEmail(subject, body) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASSWORD
    }
  });

  let mailOptions = {
    from: SENDER_EMAIL,
    to: SENDER_EMAIL,
    subject: subject,
    text: body
  };

  await transporter.sendMail(mailOptions);
}

async function parseWithText(boardUrl, keyword, config) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(boardUrl, { waitUntil: 'networkidle2' });
  const content = await page.content();
  await browser.close();

  const $ = cheerio.load(content);
  const posts = $(config.postSelector);
  const matchedPosts = [];

  posts.each((i, el) => {
    const title = $(el).find(config.titleSelector).text().trim();
    const link = $(el).find(config.linkSelector).attr('href');

    if (title.includes(keyword)) {
      matchedPosts.push({ title, link: new URL(link, boardUrl).href });
    }
  });

  return matchedPosts;
}

async function parseWithOCR(boardUrl, keyword, config) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(boardUrl, { waitUntil: 'networkidle2' });

  const timestamp = Date.now();
  const screenshotPath = path.join(SCREENSHOT_DIR, `ocr-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();

  const { data: { text } } = await tesseract.recognize(screenshotPath, 'eng+kor', {
    logger: m => console.log(m)
  });

  const matchedLines = text
    .split('\n')
    .filter(line => line.includes(keyword));

  return matchedLines.map(line => ({ title: line, link: boardUrl }));
}

async function fetchBoard(boardUrl, keyword, config) {
  if (config.parsing_type === 'ocr') {
    return await parseWithOCR(boardUrl, keyword, config.parsing_config);
  } else {
    return await parseWithText(boardUrl, keyword, config.parsing_config);
  }
}

async function main() {
  const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const boardConfigs = JSON.parse(configData);
  const allPostsToNotify = [];

  for (const boardConfig of boardConfigs) {
    try {
      const matchedPosts = await fetchBoard(boardConfig.url, boardConfig.keyword, boardConfig);
      if (matchedPosts.length > 0) {
        allPostsToNotify.push({ board: boardConfig.url, posts: matchedPosts });
      }
    } catch (err) {
      console.error(`Error fetching board ${boardConfig.url}:`, err);
    }
  }

  if (allPostsToNotify.length > 0) {
    let emailBody = '🔔 키워드에 매칭된 새 게시물이 발견되었습니다:\n\n';
    allPostsToNotify.forEach(entry => {
      emailBody += `📌 [${entry.board}]\n`;
      entry.posts.forEach(post => {
        emailBody += `- ${post.title}\n  ${post.link}\n`;
      });
      emailBody += '\n';
    });

    await sendEmail('📬 키워드 알림: 새로운 게시물 발견', emailBody);
  } else {
    console.log('❌ 키워드에 매칭되는 새 게시물이 없습니다.');
  }
}

main().catch(console.error);
