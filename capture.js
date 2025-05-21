const puppeteer = require('puppeteer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://www.sbiz24.kr/#/cmmn/gnrl/bbs/4?aditFieldNm1=13&pstTtl&mySearch=N&isSearch=Y';

async function captureScreenshot(url, outputPath) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    await page.goto(url, { waitUntil: 'networkidle0' });
  
    await new Promise(resolve => setTimeout(resolve, 2000)); // 대체 대기
    await page.screenshot({ path: outputPath, fullPage: true });
  
    await browser.close();
  }
  

async function runOCR(imagePath) {
  const { data: { text } } = await Tesseract.recognize(imagePath, 'kor+eng', {
    logger: m => console.log(m.status)
  });
  return text;
}

async function main() {
  const screenshotPath = path.join(__dirname, 'page.png');

  console.log('📸 Taking screenshot...');
  await captureScreenshot(TARGET_URL, screenshotPath);

  console.log('🔍 Running OCR...');
  const ocrText = await runOCR(screenshotPath);

  console.log('📄 Extracted Text:\n');
  console.log(ocrText);

  // 텍스트를 줄 단위로 정리 (선택사항)
  const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);
  console.log('\n📋 목록 추출:');
  lines.forEach((line, index) => {
    console.log(`${index + 1}. ${line}`);
  });
}

main().catch(console.error);
