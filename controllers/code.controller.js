//**********************************************/
//   @Project :  (메타봇)
//   @File : Codecontroller.js
//   @Desc :  controller
//   @Team : 
//   @Author : 
//**********************************************/

const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const code = db.code;
const commonLib = require('../modules/common.lib')

exports.getCodes = async (req, res, next) => {
  
  console.log("getCodes");
  const url = require('url');
  const hostname = req.headers.host;
  const pathname = url.parse(req.url).pathname;
  const selfUrl = 'http://' + hostname + pathname;
  let org_id = req.session.org_id;
  console.log("org_id=" + org_id);
  
  const iPage = req.query.iPage;
  const pWord = req.query.iWord;
  var iWord = "";
  if (pWord != undefined) iWord = pWord.toString().replace(",", "");
  
  let iParams = "";
  let whereSql = "";
  //let whereSql = `WHERE reg_mb_id = '${req.session.mb_id}'`;
  
  if (iWord) {
    whereSql += ` where  like '%${iWord}%'`;
    iParams = iParams + "&iWord=" + iWord;
  }
  
  //전체 글 갯수 획득
  let query = `SELECT count(*) as cnt FROM tb_code ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt
  
  //페이징 설정
  let page = 1;
  if (iPage > 0) page = iPage;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;
  
  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, iParams);
  
  query = `SELECT idx,cd_tp,cd_cd,cd_nm,cd_seq,cd_desc,org_id FROM tb_code ${whereSql} ORDER BY  idx DESC  LIMIT  ${fromRecord}, ${pageRow}`;
  sequelize.query(query, { type: QueryTypes.SELECT })
  .then(rows => {
      if (rows.length > 0) {
        rows.map(function (elem) {
            for (const [key, value] of Object.entries(elem)) {
              if (typeof (value) == "object" && value != undefined) {
                elem[key] = value.toString('utf8');
              }
            }
          });
        console.log(rows);
        
        res.render('codelist', {
            user: req.session, message: "", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging,
          });
      } else {
        res.render('codelist', {
            user: req.session, message: "no data found", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging,
          });
      }
    })
  .catch(error => {
      res.json({
          status: '400',
          message: error,
        });
    });
}

exports.postCodes = async (req, res, next) => {
  
  console.log("postCodes");
  const inputVal = Object.values(req.body);
  console.log(inputVal);
  
  //페이징 설정
  let page = 1;
  if (iPage > 0) page = iPage;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;
  
  let paging = commonLib.getPaging(
    page,
    pageRow,
    pageScale,
    totalCount,
    selfUrl,
    iParams
  );
  
  //전체 글 획득
  query = `SELECT idx,cd_tp,cd_cd,cd_nm,cd_seq,cd_desc,org_id
  FROM tb_code             
  ${whereSql} 
  ORDER BY idx DESC LIMIT  ${fromRecord}, ${pageRow}`;
  console.log(query);
  const rows = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  
  rows.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  
  console.log(rows);
  
  res.render("codelist", {
      message: "",
      err: "",
      list: rows,
      rWord: iWord,
      rPage: iPage,
      paging: paging,
      user: req.session,
    });
}

exports.getCode = async (req, res, next) => {
  
  console.log("getCode");
  let info = {
    reg_mb_id: req.session.mb_id,
    org_id: req.session.org_id,
    reg_dt: sequelize.fn("NOW")
  }
  
  res.render('codeform', { user: req.session, message: "", err: "", info: info, user: req.session,
    });
  
}

exports.addCode = async (req, res, next) => {
  
  console.log("addCodepost");
  const inputVal = Object.values(req.body);
  console.log(inputVal);
  
  let info = {
    cd_tp : req.body.cd_tp,
    cd_cd : req.body.cd_cd,
    cd_nm : req.body.cd_nm,
    cd_seq : req.body.cd_seq,
    cd_desc : req.body.cd_desc,
    org_id : req.body.org_id
  };
  console.log(info);
  
  //
  // 필요시 중복체크 로직
  //
  /*
  const cnt = await db.Codecount({
      where: {
        idx : idx
      },
    })
  if (cnt > 0) {
    res.json({
        status: '400',
        message: '코드코드 중복입니다'
      });
    return;
  }
  
  // console.log(cnt)
  */
  
  const row = await db.code.create(info).catch((err) => console.log(err));
  console.log("row=" + row);
  
  res.json({
      status: '200',
      message: '등록하였습니다',
      info: row,
    });
}

exports.viewCode = async (req, res, next) => {
  console.log("view =" + JSON.stringify(req.body));
  const idx = req.body.idx;
  const iPage = req.body.iPage;
  //const i = req.body.i;
  const iWord = req.body.iWord;
  
  let query = `SELECT * FROM tb_code where idx = ${idx}`;
  const row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  row.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof (value) == "object" && value != undefined) {
          elem[key] = value.toString('utf8');
        }
      }
    });
  
  res.render('codeview', {
      user: req.session, message: "", err: "", info: row[0], rid: idx, rPage: iPage, rWord: iWord, user: req.session,
    });
  
}

exports.updateCode = async (req, res, next) => {
  
  console.log("updateCodepatch");
  let info = {
    idx : req.body.idx,
    cd_tp : req.body.cd_tp,
    cd_cd : req.body.cd_cd,
    cd_nm : req.body.cd_nm,
    cd_seq : req.body.cd_seq,
    cd_desc : req.body.cd_desc,
    org_id : req.body.org_id
  };
  console.log(info);
  
  const idx = req.body.idx;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;
  
  const result = await db.code.update(
    info,
    {
      where: {
        idx: idx,
      },
    }
  ).catch(err => { console.error(err); });
  
  res.json({
      status: '200',
      message: "수정하였습니다",
    });
}

exports.deleteCode = async (req, res) => {
  console.log("deleteCode=" + req.params.idx);
  
  try {
    const data = await db.code.destroy({
        where: {
          idx: req.params.idx,
        },
      })
    res.json({
        status: '200',
        message: '삭제하였습니다',
      })
  } catch (error) {
    res.json({
        status: '400',
        message: '네트워크 에러 입니다',
        error: {
          message: error.message || serverErrorMsg,
        },
      })
  }
};

exports.manageCode = async (req, res, next) => {
  console.log("manageCode");
  const idx = req.body.idx;
  const iPage = req.body.iPage;
  const i = req.body.i;
  const iWord = req.body.iWord;
  const info = {
    reg_mb_id: req.session.mb_id,
    org_id: req.session.org_id,
    reg_dt: sequelize.fn("NOW")
  }
  
  let query = `SELECT * 
  FROM tb_code 
  WHERE reg_mb_id = '${req.session.mb_id}'
  ORDER BY idx`;
  
  console.log(query);
  constCodeList = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  CodeList.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  
  // content
  query = `SELECT * 
  FROM tb_code 
  where idx = 
  (select min(idx) idx 
    FROM tb_code 
    WHERE reg_mb_id = '${req.session.mb_id}')`;
  
  row = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  row.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  
  console.log(row);
  
  var sel_dbconfig_id = row[0].dbconfig_id;
  
  if (!sel_dbconfig_id) sel_dbconfig_id = "all";
  
  query = `
  SELECT 
  dm.idx,
  dm.dbconfig_id,
  dm.table_id,
  dm.table_name,
  dbc.db_name
  FROM 
  tb_data_model dm
  LEFT JOIN 
  tb_db_config dbc ON dm.dbconfig_id = dbc.dbconfig_id
  ORDER BY 
  dm.dbconfig_id, dm.table_id;
  `;
  
  const datamodelList = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  datamodelList.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  console.log(JSON.stringify(datamodelList, null, 2));
  
  //전체 글 획득
  query = `SELECT * 
  FROM tb_code 
  WHERE 1
  ORDER BY idx`;
  console.log(query);
  const codeList = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  codeList.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  
  res.render("codemanager", {
      message: "",
      err: "",
      info: info,
      rid: idx,
      rPage: iPage,
      rWord: iWord,
      codeList: codeList,
      dbconfigList: dbconfigList,
      datamodelList: datamodelList,
      user: req.session,
    });
};

exports.listCode = async (req, res, next) => {
  console.log("listCodes..");
  
  let cd_tp = req.params.cd_tp;
  let whereSql = `WHERE cd_tp = '${cd_tp}' and use_yn = 'Y' `;
  
  //전체 글 갯수 획득
  query = `SELECT count(*) as cnt FROM tb_code ${whereSql}`;
  let [rsltOne] = await sequelize
  .query(query, { type: QueryTypes.SELECT })
  .catch((err) => {
      console.error(err);
    });
  const totalCount = rsltOne.cnt;
  
  //전체 글 획득
  query = `SELECT cd_cd, cd_nm, cd_tp, cd_seq
  FROM tb_code              
  ${whereSql} 
  ORDER BY cd_seq desc`;
  console.log(query);
  const rows = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  rows.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  res.json(rows);
};

exports.selectCode = async (req, res, next) => {
  console.log("selectCode.");
  
  const idx = req.params.idx;
  
  //전체 글 획득
  const query = `SELECT * FROM tb_code WHERE idx = ${idx}`;
  console.log(query);
  const rows = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  rows.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  res.json(rows[0]);
};
