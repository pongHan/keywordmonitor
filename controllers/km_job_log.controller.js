//**********************************************/
//   @Project : keywordmonitor
//   @File : km_job_log.controller.js
//   @Desc : Job log controller
//   @Author : modeller77@gmail.com
//**********************************************/

const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const kmJobLog = db.km_job_log;
const commonLib = require('../modules/common.lib');

exports.getLogs = async (req, res, next) => {
  console.log("getLogs");
  const url = require('url');
  const hostname = req.headers.host;
  const pathname = url.parse(req.url).pathname;
  const selfUrl = 'http://' + hostname + pathname;

  const iPage = req.query.iPage;
  const iWord = req.query.iWord || '';

  let iParams = "";
  let whereSql = "";
  let user_id = req.session.mb_id;
  if (user_id === "modeller77@gmail.com") {
    whereSql = " WHERE 1 ";
  } else {
    whereSql = `WHERE req_id IN (SELECT req_id FROM km_request WHERE req_mb_id = '${req.session.mb_id}')`;
  }

  if (iWord) {
    whereSql += ` AND board_name LIKE '%${iWord}%'`;
    iParams += `&iWord=${iWord}`;
  }

  // Get total count
  let query = `SELECT COUNT(*) AS cnt FROM km_job_log ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt;

  // Pagination
  let page = iPage > 0 ? parseInt(iPage) : 1;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, iParams);

  // Fetch logs
  query = `SELECT log_id, req_id, board_name, status, result, post_cnt, new_cnt,
                  DATE_FORMAT(reg_datetime, '%Y-%m-%d %H:%i:%s') AS reg_datetime
           FROM km_job_log ${whereSql}
           ORDER BY reg_datetime DESC
           LIMIT ${fromRecord}, ${pageRow}`;
  sequelize.query(query, { type: QueryTypes.SELECT })
    .then(rows => {
      if (rows.length > 0) {
        rows.forEach(row => {
          for (const [key, value] of Object.entries(row)) {
            if (typeof value === "object" && value !== null) {
              row[key] = value.toString('utf8');
            }
          }
        });
        res.render('loglist', {
          user: req.session,
          message: "",
          err: "",
          list: rows,
          rWord: iWord,
          rPage: iPage,
          paging: paging
        });
      } else {
        res.render('loglist', {
          user: req.session,
          message: "No data found",
          err: "",
          list: rows,
          rWord: iWord,
          rPage: iPage,
          paging: paging
        });
      }
    })
    .catch(error => {
      res.json({
        status: '400',
        message: error.message
      });
    });
};

exports.postLogs = async (req, res, next) => {
  console.log("postLogs");
  const inputVal = Object.values(req.body);
  console.log(inputVal);

  let whereSql = "";
  let user_id = req.session.mb_id;
  if (user_id === "modeller77@gmail.com") {
    whereSql = " WHERE 1 ";
  } else {
    whereSql = `WHERE req_id IN (SELECT req_id FROM km_request WHERE req_mb_id = '${req.session.mb_id}')`;
  }

  // Get total count
  let query = `SELECT COUNT(*) AS cnt FROM km_job_log ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt;

  // Pagination
  let page = req.query.iPage > 0 ? parseInt(req.query.iPage) : 1;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  const selfUrl = 'http://' + req.headers.host + url.parse(req.url).pathname;
  let iParams = req.query.iWord ? `&iWord=${req.query.iWord}` : "";
  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, iParams);

  // Fetch logs
  query = `SELECT log_id, req_id, board_name, status, result, post_cnt, new_cnt,
                  DATE_FORMAT(reg_datetime, '%Y-%m-%d %H:%i:%s') AS reg_datetime
           FROM km_job_log ${whereSql}
           ORDER BY reg_datetime DESC
           LIMIT ${fromRecord}, ${pageRow}`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true })
    .catch(err => { console.error(err); });

  rows.forEach(row => {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "object" && value !== null) {
        row[key] = value.toString('utf8');
      }
    }
  });

  res.render("loglist", {
    message: "",
    err: "",
    list: rows,
    rWord: req.query.iWord || '',
    rPage: req.query.iPage || 1,
    paging: paging,
    user: req.session
  });
};

exports.getLog = async (req, res, next) => {
  console.log("getLog");
  let info = {
    reg_mb_id: req.session.mb_id,
    reg_datetime: sequelize.fn("NOW")
  };

  res.render('logform', {
    user: req.session,
    message: "",
    err: "",
    info: info
  });
};

exports.addLog = async (req, res, next) => {
  console.log("addLog");
  const inputVal = Object.values(req.body);
  console.log(inputVal);

  let info = {
    req_id: req.body.req_id,
    board_name: req.body.board_name,
    status: req.body.status,
    result: req.body.result,
    post_cnt: req.body.post_cnt,
    new_cnt: req.body.new_cnt,
    reg_datetime: sequelize.fn("NOW")
  };
  console.log(info);

  try {
    const row = await kmJobLog.create(info);
    res.json({
      status: '200',
      message: '등록하였습니다',
      info: row
    });
  } catch (err) {
    res.json({
      status: '400',
      message: err.message
    });
  }
};

exports.viewLog = async (req, res, next) => {
  console.log("viewLog =" + JSON.stringify(req.body));
  const log_id = req.body.log_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;

  let query = `SELECT log_id, req_id, board_name, status, result, post_cnt, new_cnt,
                      DATE_FORMAT(reg_datetime, '%Y-%m-%d %H:%i:%s') AS reg_datetime
               FROM km_job_log
               WHERE log_id = ${log_id}`;
  const row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  row.forEach(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value !== null) {
        elem[key] = value.toString('utf8');
      }
    }
  });

  res.render('logview', {
    user: req.session,
    message: "",
    err: "",
    info: row[0],
    rid: log_id,
    rPage: iPage,
    rWord: iWord
  });
};

exports.updateLog = async (req, res, next) => {
  console.log("updateLog");
  let info = {
    req_id: req.body.req_id,
    board_name: req.body.board_name,
    status: req.body.status,
    result: req.body.result,
    post_cnt: req.body.post_cnt,
    new_cnt: req.body.new_cnt
  };
  console.log(info);

  const log_id = req.body.log_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;

  try {
    const result = await kmJobLog.update(info, {
      where: { log_id: log_id }
    });
    res.json({
      status: '200',
      message: "수정하였습니다"
    });
  } catch (err) {
    res.json({
      status: '400',
      message: err.message
    });
  }
};

exports.deleteLog = async (req, res) => {
  console.log("deleteLog=" + req.params.log_id);

  try {
    await kmJobLog.destroy({
      where: { log_id: req.params.log_id }
    });
    res.json({
      status: '200',
      message: '삭제하였습니다'
    });
  } catch (error) {
    res.json({
      status: '400',
      message: '네트워크 에러 입니다',
      error: { message: error.message }
    });
  }
};

exports.listLogs = async (req, res, next) => {
  console.log("listLogs");

  let whereSql = `WHERE 1`;
  let user_id = req.session.mb_id;
  if (user_id !== "modeller77@gmail.com") {
    whereSql = `WHERE req_id IN (SELECT req_id FROM km_request WHERE req_mb_id = '${req.session.mb_id}')`;
  }

  let query = `SELECT log_id, req_id, board_name, status, post_cnt, new_cnt,
                      DATE_FORMAT(reg_datetime, '%Y-%m-%d %H:%i:%s') AS reg_datetime
               FROM km_job_log ${whereSql}
               ORDER BY reg_datetime DESC`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true })
    .catch(err => { console.error(err); });

  rows.forEach(row => {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "object" && value !== null) {
        row[key] = value.toString('utf8');
      }
    }
  });

  res.json(rows);
};

exports.selectLog = async (req, res, next) => {
  console.log("selectLog");

  const log_id = req.params.log_id;

  let query = `SELECT log_id, req_id, board_name, status, result, post_cnt, new_cnt,
                      DATE_FORMAT(reg_datetime, '%Y-%m-%d %H:%i:%s') AS reg_datetime
               FROM km_job_log
               WHERE log_id = ${log_id}`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true })
    .catch(err => { console.error(err); });

  rows.forEach(row => {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "object" && value !== null) {
        row[key] = value.toString('utf8');
      }
    }
  });

  res.json(rows[0] || {});
};
