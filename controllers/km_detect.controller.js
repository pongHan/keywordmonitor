//**********************************************/
//   @Project : alphaBot (메타봇)
//   @File : km_detect.controller.js
//   @Desc : 감지 controller
//   @Team : 
//   @Author : modeller77@gmail.com
//**********************************************/

const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const km_detect = db.km_detect;
const commonLib = require('../modules/common.lib');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const puppeteer = require('puppeteer');




exports.screenshotDetection = async (req, res) => {
  const { detect_id } = req.params;
  console.log("screenshotDetection: detect_id=" + detect_id);

  try {
    if (!km_detect) {
      throw new Error('km_detect model is undefined');
    }
    const detection = await km_detect.findOne({
      where: { detect_id, detect_status: { [Op.ne]: 'deleted' } }
    });
    if (!detection) {
      console.log(`No detection found for detect_id=${detect_id}`);
      return res.status(404).json({ success: false, message: 'Detection not found', status: 404 });
    }

    const post_url = detection.post_url;
    console.log(`post_url=${post_url}`);

    // Normalize and encode URL
    let normalized_url;
    try {
      normalized_url = new URL(post_url).href;
      console.log(`Normalized URL: ${normalized_url}`);
    } catch (urlError) {
      console.error(`URL parsing error: ${urlError.message}`);
      return res.status(400).json({ success: false, message: 'Invalid URL structure', status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
      // Set viewport to a reasonable width to ensure consistent rendering
      await page.setViewport({ width: 1280, height: 720 });

      // Navigate to the URL
      await page.goto(normalized_url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Capture full-page screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true // Capture the entire scrollable content
      });

      await browser.close();

      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="screenshot_${detect_id}.png"`
      });
      res.send(screenshot);
    } catch (navigationError) {
      console.error(`Navigation error for URL ${normalized_url}:`, navigationError);
      await browser.close();
      return res.status(500).json({ success: false, message: 'Failed to load URL', status: 500 });
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return res.status(500).json({ success: false, message: 'Server error', status: 500 });
  }
};

exports.getDetects = async (req, res, next) => {
  const url = require('url');
  const hostname = req.headers.host;
  const pathname = url.parse(req.url).pathname;
  const selfUrl = 'http://' + hostname + pathname;

  const iPage = req.query.iPage;
  const pWord = req.query.iWord;
  var iWord = "";
  if (pWord != undefined) iWord = pWord.toString().replace(",", "");

  let whereSql = "WHERE 1";
  let user_id = req.session.mb_id;
/*   if (user_id !== "modeller77@gmail.com") {
    whereSql = `WHERE req_mb_id = '${req.session.mb_id}'`;
  }
 */
  if (iWord) {
    whereSql += ` AND (board_name LIKE '%${iWord}%' OR keyword LIKE '%${iWord}%' OR post_title LIKE '%${iWord}%')`;
  }

  // 전체 글 갯수 획득
  let query = `SELECT COUNT(*) as cnt FROM km_detect ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt;

  // 페이징 설정
  let page = 1;
  if (iPage > 0) page = iPage;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, `&iWord=${iWord}`);

  query = `SELECT detect_id, req_id, req_mb_id, board_name, post_url, keyword, detect_datetime, post_title, post_content, detect_status, after_proc, proc_datetime
             FROM km_detect ${whereSql}
             ORDER BY detect_id DESC
             LIMIT ${fromRecord}, ${pageRow}`;
  sequelize.query(query, { type: QueryTypes.SELECT })
    .then(rows => {
      if (rows.length > 0) {
        rows.map(elem => {
          for (const [key, value] of Object.entries(elem)) {
            if (typeof value === "object" && value !== undefined) {
              elem[key] = value.toString('utf8');
            }
          }
          elem.detect_date_formatted = dayjs(elem.detect_datetime).format('YYYY-MM-DD');

        });

        res.render('detectlist', {
          user: req.session, message: "", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging
        });
      } else {
        res.render('detectlist', {
          user: req.session, message: "no data found", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging
        });
      }
    })
    .catch(error => {
      res.json({ status: '400', message: error.message });
    });
};

exports.postDetects = async (req, res, next) => {
  const inputVal = Object.values(req.body);
  const iPage = req.query.iPage;
  const pWord = req.query.iWord;
  var iWord = "";
  if (pWord != undefined) iWord = pWord.toString().replace(",", "");

  let whereSql = "WHERE 1";
  let user_id = req.session.mb_id;
  if (user_id !== "modeller77@gmail.com") {
    whereSql = `WHERE req_mb_id = '${req.session.mb_id}'`;
  }
  if (iWord) {
    whereSql += ` AND (board_name LIKE '%${iWord}%' OR keyword LIKE '%${iWord}%' OR post_title LIKE '%${iWord}%')`;
  }

  // 페이징 설정
  let page = 1;
  if (iPage > 0) page = iPage;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, `&iWord=${iWord}`);

  query = `SELECT detect_id, req_id, req_mb_id, board_name, post_url, keyword, detect_datetime, post_title, post_content, detect_status, after_proc, proc_datetime
             FROM km_detect ${whereSql}
             ORDER BY detect_id DESC
             LIMIT ${fromRecord}, ${pageRow}`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });

  rows.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value !== undefined) {
        elem[key] = value.toString('utf8');
      }
    }
  });

  res.render('detectlist', {
    message: "", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging, user: req.session
  });
};

exports.getDetect = async (req, res, next) => {
  let info = {
    req_mb_id: req.session.mb_id,
    detect_datetime: sequelize.fn("NOW")
  };
  res.render('detectform', { user: req.session, message: "", err: "", info: info });
};

exports.addDetect = async (req, res, next) => {
  const inputVal = Object.values(req.body);
  let info = {
    req_id: req.body.req_id || 0,
    req_mb_id: req.session.mb_id,
    board_name: req.body.board_name,
    post_url: req.body.post_url,
    keyword: req.body.keyword,
    post_title: req.body.post_title,
    post_content: req.body.post_content,
    detect_status: req.body.detect_status || 'open',
    after_proc: req.body.after_proc || '',
    proc_datetime: req.body.proc_datetime || '0000-00-00 00:00:00',
    detect_datetime: sequelize.fn("NOW")
  };

  // 중복 체크 (req_mb_id와 post_url 기준)
  const cnt = await km_detect.count({
    where: {
      req_mb_id: info.req_mb_id,
      post_url: info.post_url
    }
  });
  if (cnt > 0) {
    res.json({ status: '400', message: '이미 등록된 요청 URL입니다' });
    return;
  }

  const row = await km_detect.create(info).catch(err => { console.error(err); });
  res.json({ status: '200', message: '등록하였습니다', info: row });
};

exports.viewDetect = async (req, res, next) => {
  const detect_id = req.body.detect_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;

  let query = `SELECT detect_id, req_id, req_mb_id, board_name, post_url, keyword, detect_datetime, post_title, post_content, detect_status, after_proc, proc_datetime
                 FROM km_detect
                WHERE detect_id = ${detect_id}`;
  const row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  row.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value !== undefined) {
        elem[key] = value.toString('utf8');
      }
    }
    elem.detect_date_formatted = dayjs(elem.detect_datetime).format('YYYY-MM-DD');
  });

  res.render('detectview', {
    user: req.session, message: "", err: "", info: row[0], rid: detect_id, rPage: iPage, rWord: iWord
  });
};

exports.updateDetect = async (req, res, next) => {
  const detect_id = req.body.detect_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;
  let info = {
    req_id: req.body.req_id,
    req_mb_id: req.body.req_mb_id,
    board_name: req.body.board_name,
    post_url: req.body.post_url,
    keyword: req.body.keyword,
    post_title: req.body.post_title,
    post_content: req.body.post_content,
    detect_status: req.body.detect_status,
    after_proc: req.body.after_proc,
    proc_datetime: req.body.proc_datetime
  };

  const result = await km_detect.update(
    info,
    { where: { detect_id: detect_id } }
  ).catch(err => { console.error(err); });

  res.json({ status: '200', message: '수정하였습니다' });
};

exports.deleteDetect = async (req, res) => {
  try {
    const data = await km_detect.destroy({
      where: { detect_id: req.params.detect_id }
    });
    res.json({ status: '200', message: '삭제하였습니다' });
  } catch (error) {
    res.json({ status: '400', message: '네트워크 에러입니다', error: { message: error.message } });
  }
};

exports.deleteDetectAll = async (req, res) => {
  try {
    const data = await km_detect.destroy({
      where: {}, // 모든 조건 제거 => 전체 삭제
      truncate: true  // 물리적으로 테이블 비우기 (옵션)
    });

    res.json({ status: '200', message: '전체 삭제하였습니다' });
  } catch (error) {
    res.json({ status: '400', message: '네트워크 에러입니다', error: { message: error.message } });
  }
};

exports.listDetects = async (req, res, next) => {
  let whereSql = "WHERE 1";

  // 전체 글 갯수 획득
  query = `SELECT COUNT(*) as cnt FROM km_detect ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt;

  query = `SELECT detect_id, board_name, keyword
             FROM km_detect ${whereSql}
             ORDER BY detect_id DESC`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  rows.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value !== undefined) {
        elem[key] = value.toString('utf8');
      }
    }
  });
  res.json(rows);
};

exports.selectDetect = async (req, res, next) => {
  const detect_id = req.params.detect_id;
  const query = `SELECT * FROM km_detect WHERE detect_id = ${detect_id}`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  rows.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value !== undefined) {
        elem[key] = value.toString('utf8');
      }
    }
  });
  res.json(rows[0]);
};