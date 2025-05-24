/**********************************************/
//   @Project : keywordmonitor
//   @File : km_finder_run.controller.js
//   @Desc : 파인더 실행 로그 컨트롤러
//   @Team : 
//   @Author : 
/**********************************************/

const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const km_finder_run = db.km_finder_run;
const commonLib = require('../modules/common.lib');

exports.getRuns = async (req, res, next) => {
  console.log("getRuns");
  const url = require('url');
  const hostname = req.headers.host;
  const pathname = url.parse(req.url).pathname;
  const selfUrl = 'http://' + hostname + pathname;

  const iPage = req.query.iPage;
  const pWord = req.query.iWord;
  let iWord = pWord ? pWord.toString().replace(",", "") : "";

  let iParams = "";
  let whereSql = " WHERE 1 ";

  if (iWord) {
    whereSql += ` AND run_date LIKE '%${iWord}%'`;
    iParams += "&iWord=" + iWord;
  }

  // 전체 로그 수 조회
  let query = `SELECT COUNT(*) as cnt FROM km_finder_run ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt;

  // 페이징 설정
  let page = iPage > 0 ? iPage : 1;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, iParams);

  query = `SELECT run_id, run_date, run_cnt,
                  DATE_FORMAT(run_datetime, '%Y-%m-%d %H:%i:%s') AS run_datetime
           FROM km_finder_run ${whereSql} 
           ORDER BY run_id DESC  
           LIMIT ${fromRecord}, ${pageRow}`;
  sequelize.query(query, { type: QueryTypes.SELECT })
    .then(rows => {
      if (rows.length > 0) {
        rows.map(elem => {
          for (const [key, value] of Object.entries(elem)) {
            if (typeof value === "object" && value != null) {
              elem[key] = value.toString('utf8');
            }
          }
        });
        res.render('runlist', {
          user: req.session, message: "", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging
        });
      } else {
        res.render('runlist', {
          user: req.session, message: "no data found", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging
        });
      }
    })
    .catch(error => {
      res.json({
        status: '400',
        message: error.message || "서버 오류가 발생했습니다."
      });
    });
};

exports.postRuns = async (req, res, next) => {
  console.log("postRuns");
  const inputVal = Object.values(req.body);
  console.log(inputVal);

  let page = req.body.iPage > 0 ? req.body.iPage : 1;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;

  let whereSql = " WHERE 1 ";
  let query = `SELECT run_id, run_date, run_cnt,
                  DATE_FORMAT(run_datetime, '%Y-%m-%d %H:%i:%s') AS run_datetime
           FROM km_finder_run ${whereSql} 
           ORDER BY run_id DESC  
           LIMIT ${fromRecord}, ${pageRow}`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });

  rows.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value != null) {
        elem[key] = value.toString("utf8");
      }
    }
  });

  let paging = commonLib.getPaging(page, pageRow, pageScale, rows.length, '', '');
  res.render("runlist", {
    message: "",
    err: "",
    list: rows,
    rWord: req.body.iWord || "",
    rPage: req.body.iPage || 1,
    paging: paging,
    user: req.session
  });
};

exports.getRun = async (req, res, next) => {
  console.log("getRun");
  let info = {
    run_date: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
    run_cnt: 0,
    run_datetime: sequelize.fn("NOW")
  };

  res.render('runform', {
    user: req.session, message: "", err: "", info: info
  });
};

exports.addRun = async (req, res, next) => {
  console.log("addRun");
  const inputVal = Object.values(req.body);
  console.log(inputVal);

  let info = {
    run_date: req.body.run_date,
    run_cnt: req.body.run_cnt,
    run_datetime: sequelize.fn("NOW")
  };

  const row = await km_finder_run.create(info).catch(err => console.error(err));
  res.json({
    status: '200',
    message: '로그가 등록되었습니다.',
    info: row
  });
};

exports.viewRun = async (req, res, next) => {
  console.log("viewRun =" + JSON.stringify(req.body));
  const run_id = req.body.run_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;

  let query = `SELECT run_id, run_date, run_cnt,
                  DATE_FORMAT(run_datetime, '%Y-%m-%d %H:%i:%s') AS run_datetime
               FROM km_finder_run 
               WHERE run_id = ${run_id}`;
  const row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });

  row.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value != null) {
        elem[key] = value.toString('utf8');
      }
    }
  });

  res.render('runview', {
    user: req.session, message: "", err: "", info: row[0], rid: run_id, rPage: iPage, rWord: iWord
  });
};

exports.updateRun = async (req, res, next) => {
  console.log("updateRun");
  let info = {
    run_date: req.body.run_date,
    run_cnt: req.body.run_cnt
  };

  const run_id = req.body.run_id;
  const result = await km_finder_run.update(info, {
    where: { run_id: run_id }
  }).catch(err => { console.error(err); });

  res.json({
    status: '200',
    message: "로그가 수정되었습니다."
  });
};

exports.deleteRun = async (req, res) => {
  console.log("deleteRun=" + req.params.run_id);

  try {
    await km_finder_run.destroy({
      where: { run_id: req.params.run_id }
    });
    res.json({
      status: '200',
      message: '로그가 삭제되었습니다.'
    });
  } catch (error) {
    res.json({
      status: '400',
      message: '네트워크 오류가 발생했습니다.',
      error: { message: error.message || "서버 오류" }
    });
  }
};

exports.listRuns = async (req, res, next) => {
  console.log("listRuns");

  let whereSql = `WHERE 1`;
  let query = `SELECT run_id, run_date, run_cnt,
                  DATE_FORMAT(run_datetime, '%Y-%m-%d %H:%i:%s') AS run_datetime
               FROM km_finder_run ${whereSql} 
               ORDER BY run_id DESC`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });

  rows.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value != null) {
        elem[key] = value.toString("utf8");
      }
    }
  });

  res.json(rows);
};

exports.selectRun = async (req, res, next) => {
  console.log("selectRun");
  const run_id = req.params.run_id;

  const query = `SELECT run_id, run_date, run_cnt,
                  DATE_FORMAT(run_datetime, '%Y-%m-%d %H:%i:%s') AS run_datetime
               FROM km_finder_run WHERE run_id = ${run_id}`;
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });

  rows.map(elem => {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value === "object" && value != null) {
        elem[key] = value.toString("utf8");
      }
    }
  });

  res.json(rows[0] || {});
};