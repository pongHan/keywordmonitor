const googleTrends = require('google-trends-api');
const mysql = require('mysql2/promise');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// 한국 시간대 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// NODE_ENV에 따라 적절한 .env 파일 로드
const env = process.env.NODE_ENV || 'dev';
const envPath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envPath });
console.log(`✅ Loaded .env.${env}`);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_URL:', process.env.DB_URL);

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'keyword_db'
};

// Nodemailer 설정
const transporter = nodemailer.createTransport({
  service: 'gmail', // 또는 다른 이메일 서비스
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 검색할 키워드 목록
const keywords = ['비트코인', '손흥민', '이준석'];

// Google Trends 데이터 조회 및 MySQL 저장 함수
async function fetchAndStoreTrends() {
  let connection;
  try {
    // MySQL 연결
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');

    // 현재 날짜 (한국 시간)
    const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD');

    // 알림용 데이터 수집
    const alerts = [];

    // 각 키워드에 대해 Google Trends 데이터 조회
    for (const keyword of keywords) {
      try {
        const results = await googleTrends.interestOverTime({
          keyword,
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 지난 24시간
          endTime: new Date(),
          geo: 'KR' // 한국 지역
        });

        const data = JSON.parse(results);
        // 상대적 관심도(0-100)를 추출. 검색 횟수가 아닌 최대 검색량 대비 비율.
        const interestScore = data.default.timelineData.length > 0
          ? data.default.timelineData[0].value[0]
          : 0;

        // MySQL에 데이터 삽입
        const query = `
          INSERT INTO km_trend (keyword, tr_date, search_cnt)
          VALUES (?, ?, ?)
        `;
        await connection.execute(query, [keyword, today, interestScore]);
        console.log(`✅ Stored: keyword=${keyword}, date=${today}, interest_score=${interestScore}`);

        // 관심도 80 이상 시 알림 준비
        if (interestScore >= 80) {
          alerts.push({ keyword, interestScore, date: today });
        }
      } catch (err) {
        console.error(`❌ Error fetching data for keyword ${keyword}:`, err.message);
      }
    }

    // 이메일 알림 전송
    if (alerts.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL || 'admin@example.com',
        subject: '🚨 Google Trends 관심도 알림',
        text: `다음 키워드의 관심도가 80을 초과했습니다:\n${alerts.map(a => `${a.keyword}: ${a.interestScore} (${a.date})`).join('\n')}`
      };
      await transporter.sendMail(mailOptions);
      console.log('📧 Alert email sent for high interest scores');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    // 연결 종료
    if (connection) await connection.end();
    console.log('🔌 MySQL connection closed');
  }
}

// Google Ads API 연동 주석 (검색량 추정용)
/*
  Google Ads API로 절대적 검색량 추정:
  1. 설치: npm install google-ads-api
  2. Google Cloud Console에서 OAuth 2.0 인증 설정
  3. 환경 변수 추가: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_DEVELOPER_TOKEN, GOOGLE_REFRESH_TOKEN
  4. 예시 코드:

  const { GoogleAdsApi } = require('google-ads-api');
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN
  });

  async function getSearchVolume(keyword) {
    const customer = client.Customer({
      customer_id: 'YOUR_CUSTOMER_ID',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    const response = await customer.keywordPlanIdeas.generateKeywordIdeas({
      keyword_plan_network: 'GOOGLE_SEARCH',
      keyword_seed: { keywords: [keyword] }
    });
    return response[0]?.avg_monthly_searches || 0;
  }
  
  참고: https://developers.google.com/google-ads/api/docs/start
*/

// 매일 자정(한국 시간)에 실행
cron.schedule('0 0 * * *', () => {
  console.log('⏰ Running daily Google Trends fetch at', dayjs().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'));
  fetchAndStoreTrends();
}, {
  timezone: 'Asia/Seoul'
});

// 프로그램 시작
console.log('🚀 Keyword monitoring service started');
fetchAndStoreTrends(); // 즉시 실행 (테스트용)