//**********************************************/
//   @Project : alphaBot (메타봇)
//   @File : km_request.controller.js
//   @Desc : 요청 controller
//   @Team : 
//   @Author : modeller77@gmail.com
//**********************************************/

const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const km_request = db.km_request;
const commonLib = require('../modules/common.lib');
const dayjs = require('dayjs');

exports.getRequests = async (req, res, next) => {
  const url = require('url');
  const hostname = req.headers.host;
  const pathname = url.parse(req.url).pathname;
  const selfUrl = 'http://' + hostname + pathname;
  let req_id = req.session.req_id;

  const iPage = req.query.iPage;
  const pWord = req.query.iWord;
  var iWord = "";
  if (pWord != undefined) iWord = pWord.toString().replace(",", "");

  let whereSql = "WHERE 1";
  let user_id = req.session.mb_id;
  /* if (user_id !== "modeller77@gmail.com") {
    whereSql = `WHERE req_mb_id = '${req.session.mb_id}'`;
  }
   */
  if (iWord) {
    whereSql += ` AND (board_name LIKE '%${iWord}%' OR keyword LIKE '%${iWord}%')`;
  }

  // 전체 글 갯수 획득
  let query = `SELECT COUNT(*) as cnt FROM km_request ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt;

  // 페이징 설정
  let page = 1;
  if (iPage > 0) page = iPage;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, `&iWord=${iWord}`);

  query = `SELECT req_id, req_mb_id, receiver_email, req_status, board_name, board_type, post_url, keyword,
                  start_date, end_date, email_send_yn, pay_type, pay_amount, DATE_FORMAT(reg_datetime, '%Y-%m-%d %H:%i:%s') AS reg_datetime
             FROM km_request ${whereSql}
             ORDER BY req_id DESC
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
        });
        res.render('requestlist', {
          user: req.session, message: "", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging
        });
      } else {
        res.render('requestlist', {
          user: req.session, message: "no data found", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging
        });
      }
    })
    .catch(error => {
      res.json({ status: '400', message: error.message });
    });
};

exports.postRequests = async (req, res, next) => {
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
    whereSql += ` AND (board_name LIKE '%${iWord}%' OR keyword LIKE '%${iWord}%')`;
  }

  // 페이징 설정
  let page = 1;
  if (iPage > 0) page = iPage;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, `&iWord=${iWord}`);

  query = `SELECT req_id, req_mb_id, receiver_email, req_status, board_name, board_type, post_url, keyword,
                  start_date, end_date, email_send_yn, pay_type, pay_amount, reg_datetime
             FROM km_request ${whereSql}
             ORDER BY req_id DESC
             LIMIT ${fromRecord}, ${pageRow}`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });

  rows.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value !== undefined) {
        elem[key] = value.toString('utf8');
      }
    }
  });

  res.render('requestlist', {
    message: "", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging, user: req.session
  });
};

exports.getRequest = async (req, res, next) => {
  let info = {
    req_mb_id: req.session.mb_id,
    reg_datetime: sequelize.fn("NOW")
  };
  res.render('requestform', { user: req.session, message: "", err: "", info: info });
};

exports.addRequest = async (req, res, next) => {
  const inputVal = Object.values(req.body);
  let info = {
    req_mb_id: req.session.mb_id,
    receiver_email: req.body.receiver_email,
    req_status: req.body.req_status || 'open',
    board_name: req.body.board_name,
    board_type: req.body.board_type,
    post_url: req.body.post_url,
    keyword: req.body.keyword,
    parsing_config: req.body.parsing_config,
    parsing_type: req.body.parsing_type,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    email_send_yn: req.body.email_send_yn,
    pay_type: req.body.pay_type,
    pay_amount: req.body.pay_amount,
    reg_datetime: sequelize.fn("NOW")
  };

  // 중복 체크 (req_mb_id와 post_url 기준)
  const cnt = await km_request.count({
    where: {
      req_mb_id: info.req_mb_id,
      post_url: info.post_url
    }
  });
  if (cnt > 0) {
    res.json({ status: '400', message: '이미 등록된 요청 URL입니다' });
    return;
  }

  const row = await km_request.create(info).catch(err => { console.error(err); });
  res.json({ status: '200', message: '등록하였습니다', info: row });
};

exports.viewRequest = async (req, res, next) => {
  const req_id = req.body.req_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;

  let query = `SELECT req_id, req_mb_id, receiver_email, req_status, board_name, board_type, post_url, keyword,
                      parsing_config, parsing_type, start_date, end_date, email_send_yn, pay_type, pay_amount,
                      DATE_FORMAT(reg_datetime, '%Y-%m-%d %H:%i:%s') AS reg_datetime
                 FROM km_request
                WHERE req_id = ${req_id}`;
  const row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  row.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value !== undefined) {
        elem[key] = value.toString('utf8');
      }
      elem.start_date_formatted = dayjs(elem.start_date).format('YYYY-MM-DD');
      elem.end_date_formatted = dayjs(elem.end_date).format('YYYY-MM-DD');
    }
  });

  res.render('requestview', {
    user: req.session, message: "", err: "", info: row[0], rid: req_id, rPage: iPage, rWord: iWord
  });
};

exports.updateRequest = async (req, res, next) => {
  const req_id = req.body.req_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;
  let info = {
    receiver_email: req.body.receiver_email,
    req_status: req.body.req_status,
    board_name: req.body.board_name,
    board_type: req.body.board_type,
    post_url: req.body.post_url,
    keyword: req.body.keyword,
    parsing_config: req.body.parsing_config,
    parsing_type: req.body.parsing_type,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    email_send_yn: req.body.email_send_yn,
    pay_type: req.body.pay_type,
    pay_amount: req.body.pay_amount
  };

  const result = await km_request.update(
    info,
    { where: { req_id: req_id } }
  ).catch(err => { console.error(err); });

  res.json({ status: '200', message: '수정하였습니다' });
};

exports.deleteRequest = async (req, res) => {
  try {
    const data = await km_request.destroy({
      where: { req_id: req.params.req_id }
    });
    res.json({ status: '200', message: '삭제하였습니다' });
  } catch (error) {
    res.json({ status: '400', message: '네트워크 에러입니다', error: { message: error.message } });
  }
};

exports.listRequests = async (req, res, next) => {
  let whereSql = "WHERE 1";

  // 전체 글 갯수 획득
  let query = `SELECT COUNT(*) as cnt FROM km_request ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt;

  query = `SELECT req_id, board_name, keyword
             FROM km_request ${whereSql}
             ORDER BY req_id DESC`;
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

exports.selectRequest = async (req, res, next) => {
  const req_id = req.params.req_id;
  const query = `SELECT * FROM km_request WHERE req_id = ${req_id}`;
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
