//**********************************************/
//   @Project :  (메타봇)
//   @File : Orgcontroller.js
//   @Desc :  controller
//   @Team : 
//   @Author : 
//**********************************************/

const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const org = db.org;
const commonLib = require('../modules/common.lib')

exports.getOrgs = async (req, res, next) => {
  
  console.log("getOrgs");
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
  //let whereSql = "";
  let user_id = req.session.mb_id;
  let whereSql = "";
  if(user_id==="modeller77@gmail.com")
    whereSql = " WHERE 1 ";
  else 
    whereSql = `WHERE manager_id = '${req.session.mb_id}'`;
  
  if (iWord) {
    whereSql += ` and org_name like '%${iWord}%'`;
    iParams = iParams + "&iWord=" + iWord;
  }
  
  //전체 글 갯수 획득
  let query = `SELECT count(*) as cnt FROM tb_org ${whereSql}`;
  let [rsltOne] = await sequelize.query(query, { type: QueryTypes.SELECT }).catch(err => { console.error(err); });
  const totalCount = rsltOne.cnt
  
  //페이징 설정
  let page = 1;
  if (iPage > 0) page = iPage;
  const pageRow = 12;
  const pageScale = 12;
  let fromRecord = (page - 1) * pageRow;
  
  let paging = commonLib.getPaging(page, pageRow, pageScale, totalCount, selfUrl, iParams);
  
  query = `SELECT org_id,org_name,area,manager_id,manager_email,manager_hpno,org_status,
                  DATE_FORMAT(reg_dt, '%Y-%m-%d') AS reg_dt,leave_dt
             FROM tb_org ${whereSql} 
             ORDER BY  org_id DESC  
             LIMIT  ${fromRecord}, ${pageRow}`;
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
        res.render('orglist', {
            user: req.session, message: "", err: "", list: rows, rWord: iWord, rPage: iPage, paging: paging,
          });
      } else {
        res.render('orglist', {
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

exports.postOrgs = async (req, res, next) => {
  
  console.log("postOrgs");
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
  query = `SELECT org_id,org_name,area,manager_id,manager_email,manager_hpno,org_status,reg_dt,leave_dt
  FROM tb_org             
  ${whereSql} 
  ORDER BY org_id DESC LIMIT  ${fromRecord}, ${pageRow}`;
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
  
  res.render("orglist", {
      message: "",
      err: "",
      list: rows,
      rWord: iWord,
      rPage: iPage,
      paging: paging,
      user: req.session,
    });
}

exports.getOrg = async (req, res, next) => {
  
  console.log("getOrg");
  let info = {
    reg_mb_id: req.session.mb_id,
    org_id: req.session.org_id,
    reg_dt: sequelize.fn("NOW")
  }
  
  res.render('orgform', { user: req.session, message: "", err: "", info: info, user: req.session,
      
    });
  
}

exports.addOrg = async (req, res, next) => {
  
  console.log("addOrgpost");
  const inputVal = Object.values(req.body);
  console.log(inputVal);
  
  let info = {
    org_name : req.body.org_name,
    area : req.body.area,
    manager_id : req.body.manager_id,
    manager_email : req.body.manager_email,
    manager_hpno : req.body.manager_hpno,
    org_status : req.body.org_status,
    reg_dt : sequelize.fn("NOW"),
    leave_dt : null
  };
  console.log(info);
  
  //
  // 필요시 중복체크 로직
  //
  /*
  const cnt = await db.org.count({
      where: {
        org_id : org_id
      },
    })
  if (cnt > 0) {
    res.json({
        status: '400',
        message: '기관/회사코드 중복입니다'
      });
    return;
  }
  
  // console.log(cnt)
  */
  
  const row = await db.org.create(info).catch((err) => console.log(err));
  console.log("row=" + row);
  
  res.json({
      status: '200',
      message: '등록하였습니다',
      info: row,
    });
}

exports.viewOrg = async (req, res, next) => {
  console.log("view =" + JSON.stringify(req.body));
  const org_id = req.body.org_id;
  const iPage = req.body.iPage;
  //const i = req.body.i;
  const iWord = req.body.iWord;
  
  let query = `SELECT org_id,org_name,area,manager_id,manager_email,manager_hpno,org_status,
  DATE_FORMAT(reg_dt, '%Y-%m-%d') AS reg_dt,leave_dt
                FROM tb_org 
               WHERE org_id = ${org_id}`;
  const row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  row.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof (value) == "object" && value != undefined) {
          elem[key] = value.toString('utf8');
        }
      }
    });
  
  res.render('orgview', {
      user: req.session, message: "", err: "", info: row[0], rid: org_id, rPage: iPage, rWord: iWord, user: req.session,
      
    });
  
}

exports.updateOrg = async (req, res, next) => {
  
  console.log("updateOrgpatch");
  let info = {
    org_name : req.body.org_name,
    area : req.body.area,
    manager_id : req.body.manager_id,
    manager_email : req.body.manager_email,
    manager_hpno : req.body.manager_hpno,
    org_status : req.body.org_status,
   
   
  };
  console.log(info);
  
  const org_id = req.body.org_id;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;
  
  const result = await db.org.update(
    info,
    {
      where: {
        org_id: org_id,
      },
    }
  ).catch(err => { console.error(err); });
  
  res.json({
      status: '200',
      message: "수정하였습니다",
    });
}

exports.deleteOrg = async (req, res) => {
  console.log("deleteOrg=" + req.params.org_id);
  
  try {
    const data = await db.org.destroy({
        where: {
          org_id: req.params.org_id,
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

exports.manageOrg = async (req, res, next) => {
  console.log("manageOrg");
  const org_id = req.body.org_id;
  const iPage = req.body.iPage;
  const i = req.body.i;
  const iWord = req.body.iWord;
  const info = {
    reg_mb_id: req.session.mb_id,
    org_id: req.session.org_id,
    reg_dt: sequelize.fn("NOW")
  }
  
  let query = `SELECT * 
  FROM tb_org 
  WHERE reg_mb_id = '${req.session.mb_id}'
  ORDER BY org_id`;
  
  console.log(query);
  constOrgList = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  OrgList.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  
  // content
  query = `SELECT * 
  FROM tb_org 
  where org_id = 
  (select min(org_id) org_id 
    FROM tb_org 
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
  dm.org_id,
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
  FROM tb_org 
  WHERE 1
  ORDER BY org_id`;
  console.log(query);
  const orgList = await sequelize
  .query(query, { type: QueryTypes.SELECT, raw: true })
  .catch((err) => {
      console.error(err);
    });
  orgList.map(function (elem) {
      for (const [key, value] of Object.entries(elem)) {
        if (typeof value == "object" && value != undefined) {
          elem[key] = value.toString("utf8");
        }
      }
    });
  
  res.render("orgmanager", {
      message: "",
      err: "",
      info: info,
      rid: org_id,
      rPage: iPage,
      rWord: iWord,
      orgList: orgList,
      dbconfigList: dbconfigList,
      datamodelList: datamodelList,
      user: req.session,
    });
};

exports.listOrg = async (req, res, next) => {
  console.log("listOrgs..");
  
  
  let whereSql = `WHERE 1`;
  
  //전체 글 갯수 획득
  query = `SELECT count(*) as cnt FROM tb_org ${whereSql}`;
  let [rsltOne] = await sequelize
  .query(query, { type: QueryTypes.SELECT })
  .catch((err) => {
      console.error(err);
    });
  const totalCount = rsltOne.cnt;
  
  //전체 글 획득
  query = `SELECT org_id, org_name, manager_id
  FROM tb_org              
  ${whereSql} 
  ORDER BY org_id desc`;
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

exports.selectOrg = async (req, res, next) => {
  console.log("selectOrg.");
  
  const org_id = req.params.org_id;
  
  //전체 글 획득
  const query = `SELECT * FROM tb_org WHERE org_id = ${org_id}`;
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
