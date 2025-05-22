//**********************************************/
//   @Project :  (메타봇)
//   @File : Usercontroller.js
//   @Desc :  controller
//   @Team : 
//   @Author : 
//**********************************************/

const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const db = require("../models");
const user = db.user;
const commonLib = require('../modules/common.lib')

exports.getUsers = async (req, res, next) => {
  try {
    console.log("getUsers");

    const hostname = req.headers.host;
    const pathname = url.parse(req.url).pathname;
    const selfUrl = `http://${hostname}${pathname}`;
    const org_id = req.session.org_id;
    console.log("org_id=" + org_id);

    const iPage = req.query.iPage ? parseInt(req.query.iPage, 10) : 1;
    const pWord = req.query.iWord || '';
    const iWord = pWord.toString().replace(",", "");

    let whereSql = req.session.mb_level == 10 ? 'WHERE 1 ' : `WHERE org_id = '${req.session.org_id}'`;
    if (iWord) {
      whereSql += ` AND (mb_name LIKE '%${iWord}%' OR mb_id LIKE '%${iWord}%')`;
    }

    const countQuery = `SELECT count(*) as cnt FROM tb_user ${whereSql}`;
    const [{ cnt: totalCount }] = await sequelize.query(countQuery, { type: QueryTypes.SELECT });

    const pageRow = 12;
    const pageScale = 12;
    const fromRecord = (iPage - 1) * pageRow;

    const paging = commonLib.getPaging(iPage, pageRow, pageScale, totalCount, selfUrl, `&iWord=${iWord}`);

    const selectQuery = `
      SELECT mb_no, mb_id, mb_password, mb_password2, mb_name, org_name, site_id, mb_nick,
             mb_type, mb_level, mb_email, email_verified, email_verify_date, verify_token, mb_status,
             mb_hp, org_id, dept_name, 
             DATE_FORMAT(mb_open_date,'%Y-%m-%d') as mb_open_date,
             DATE_FORMAT(mb_leave_date,'%Y-%m-%d') as mb_leave_date, mb_intercept_date 
      FROM tb_user ${whereSql} 
      ORDER BY mb_no DESC  
      LIMIT ${fromRecord}, ${pageRow}`;
    const rows = await sequelize.query(selectQuery, { type: QueryTypes.SELECT });

    rows.forEach(elem => {
      for (const [key, value] of Object.entries(elem)) {
        if (Buffer.isBuffer(value)) {
          elem[key] = value.toString('utf8');
        }
      }
    });

    res.render('userlist', {
      user: req.session,
      message: rows.length > 0 ? "" : "no data found",
      err: "",
      list: rows,
      rWord: iWord,
      rPage: iPage,
      paging: paging,
    });
  } catch (error) {
    console.error(error);
    res.json({ status: '400', message: error.message });
  }
};

exports.postUsers = async (req, res, next) => {
  try {
    console.log("postUsers");
    const inputVal = Object.values(req.body);
    console.log(inputVal);

    const iPage = req.query.iPage ? parseInt(req.query.iPage, 10) : 1;
    const pWord = req.query.iWord || '';
    const iWord = pWord.toString().replace(",", "");

    let whereSql = req.session.mb_level == 10 ? 'WHERE 1 ' : `WHERE org_id = '${req.session.org_id}'`;
    if (iWord) {
      whereSql += ` AND (mb_name LIKE '%${iWord}%' OR mb_id LIKE '%${iWord}%')`;
    }

    const countQuery = `SELECT count(*) as cnt FROM tb_user ${whereSql}`;
    const [{ cnt: totalCount }] = await sequelize.query(countQuery, { type: QueryTypes.SELECT });

    const pageRow = 12;
    const pageScale = 12;
    const fromRecord = (iPage - 1) * pageRow;

    const paging = commonLib.getPaging(iPage, pageRow, pageScale, totalCount, selfUrl, `&iWord=${iWord}`);

    const selectQuery = `
      SELECT mb_no, mb_id, mb_password, mb_password2, mb_name, org_name, site_id, mb_nick,
             mb_type, mb_level, mb_email, email_verified, email_verify_date, verify_token, mb_status,
             mb_hp, org_id, dept_name, mb_open_date, mb_leave_date, mb_intercept_date
      FROM tb_user ${whereSql} 
      ORDER BY mb_no DESC 
      LIMIT ${fromRecord}, ${pageRow}`;
    const rows = await sequelize.query(selectQuery, { type: QueryTypes.SELECT });

    rows.forEach(elem => {
      for (const [key, value] of Object.entries(elem)) {
        if (Buffer.isBuffer(value)) {
          elem[key] = value.toString('utf8');
        }
      }
    });

    res.render('userlist', {
      message: "",
      err: "",
      list: rows,
      rWord: iWord,
      rPage: iPage,
      paging: paging,
      user: req.session,
    });
  } catch (error) {
    console.error(error);
    res.json({ status: '400', message: error.message });
  }
};

// Similar refactoring would be applied to other methods.


exports.getUser = async (req, res, next) => {

  console.log("getUser");
  let info = {
    reg_mb_id: req.session.mb_id,
    org_id: req.session.org_id,
    reg_dt: sequelize.fn("NOW")
  }

  res.render('userform', {
    user: req.session, message: "", err: "", info: info, user: req.session,
  });

}

exports.addUser = async (req, res, next) => {

  console.log("addUserpost");
  const inputVal = Object.values(req.body);
  console.log(inputVal);

  let info = {
    mb_id: req.body.mb_id,
    mb_password: req.body.mb_password,
    mb_password2: req.body.mb_password2,
    mb_name: req.body.mb_name,
    org_name: req.body.org_name,
    site_id: req.body.site_id,
    mb_nick: req.body.mb_nick,
    mb_type: req.body.mb_type,
    mb_level: req.body.mb_level,
    mb_email: req.body.mb_email,
    email_verified: req.body.email_verified,
    email_verify_date: req.body.email_verify_date,
    verify_token: req.body.verify_token,
    mb_status: req.body.mb_status,
    mb_hp: req.body.mb_hp,
    org_id: req.body.org_id,
    dept_name: req.body.dept_name,
    mb_open_date: req.body.mb_open_date,
    mb_leave_date: req.body.mb_leave_date,
    mb_intercept_date: req.body.mb_intercept_date
  };
  console.log(info);

  //
  // 필요시 중복체크 로직
  //
  /*
  const cnt = await db.Usercount({
      where: {
        mb_no : mb_no
      },
    })
  if (cnt > 0) {
    res.json({
        status: '400',
        message: '사용자코드 중복입니다'
      });
    return;
  }
  
  // console.log(cnt)
  */

  const row = await db.user.create(info).catch((err) => console.log(err));
  console.log("row=" + row);

  res.json({
    status: '200',
    message: '등록하였습니다',
    info: row,
  });
}

exports.viewUser = async (req, res, next) => {
  console.log("view =" + JSON.stringify(req.body));
  const mb_no = req.body.mb_no;
  const iPage = req.body.iPage;
  //const i = req.body.i;
  const iWord = req.body.iWord;

  let query = `SELECT mb_no,mb_id,mb_password,mb_password2,mb_name,org_name,site_id,mb_nick,
                      mb_type,mb_level,mb_email,email_verified,DATE_FORMAT(email_verify_date,'%Y-%m-%d') as email_verify_date,
                      verify_token,mb_status,
                      mb_hp, org_id, 
                      (SELECT org_name FROM tb_org WHERE org_id = tb_user.org_id) AS org_name,
                      dept_name, DATE_FORMAT(mb_open_date,'%Y-%m-%d') as mb_open_date,
                      DATE_FORMAT(mb_leave_date,'%Y-%m-%d') as mb_leave_date,mb_intercept_date 
                 FROM tb_user 
                WHERE mb_no = ${mb_no}`;
  const row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  row.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof (value) == "object" && value != undefined) {
        elem[key] = value.toString('utf8');
      }
    }
  });

  res.render('userview', {
    user: req.session, message: "", err: "", info: row[0], rid: mb_no, rPage: iPage, rWord: iWord, user: req.session,
  });

}

exports.updateUser = async (req, res, next) => {

  console.log("userController updateUser patch");
  let info = {
    mb_no: req.body.mb_no,
    mb_id: req.body.mb_id,
    mb_password: req.body.mb_password,
    mb_password2: req.body.mb_password2,
    mb_name: req.body.mb_name,
    org_name: req.body.org_name,
    site_id: req.body.site_id,
    mb_nick: req.body.mb_nick,
    mb_type: req.body.mb_type,
    mb_level: req.body.mb_level,
    mb_email: req.body.mb_email,
    email_verified : req.body.email_verified,
    //email_verify_date: req.body.email_verify_date,
    //verify_token: req.body.verify_token,
    mb_status: req.body.mb_status,
    mb_hp: req.body.mb_hp,
    org_id: req.body.org_id,
    pjt_id: req.body.pjt_id,
    dept_name: req.body.dept_name,
    mb_leave_date: req.body.mb_leave_date,
    mb_intercept_date: req.body.mb_intercept_date
  };
  console.log(info);

  const mb_no = req.body.mb_no;
  const iPage = req.body.iPage;
  const iWord = req.body.iWord;

  const result = await db.user.update(
    info,
    {
      where: {
        mb_no: mb_no,
      },
    }
  ).catch(err => { console.error(err); });

  res.json({
    status: '200',
    message: "수정하였습니다",
  });
}

exports.deleteUser = async (req, res) => {
  console.log("deleteUser=" + req.params.mb_no);

  try {
    const data = await db.user.destroy({
      where: {
        mb_no: req.params.mb_no,
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

exports.manageUser = async (req, res, next) => {
  console.log("manageUser");
  const mb_no = req.body.mb_no;
  const iPage = req.body.iPage;
  const i = req.body.i;
  const iWord = req.body.iWord;
  const info = {
    reg_mb_id: req.session.mb_id,
    org_id: req.session.org_id,
    reg_dt: sequelize.fn("NOW")
  }

  let query = `SELECT * 
  FROM tb_user 
  WHERE reg_mb_id = '${req.session.mb_id}'
  ORDER BY mb_no`;

  console.log(query);
  constUserList = await sequelize
    .query(query, { type: QueryTypes.SELECT, raw: true })
    .catch((err) => {
      console.error(err);
    });
  UserList.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value == "object" && value != undefined) {
        elem[key] = value.toString("utf8");
      }
    }
  });

  // content
  query = `SELECT * 
  FROM tb_user 
  where mb_no = 
  (select min(mb_no) mb_no 
    FROM tb_user 
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
  dm.mb_no,
  dm.dbconfig_id,
  dm.table_id,
  dm.table_name,
  dbc.db_name
  FROM 
  tb_data_model dm
  JOIN 
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
  FROM tb_user 
  WHERE 1
  ORDER BY mb_no`;
  console.log(query);
  const userList = await sequelize
    .query(query, { type: QueryTypes.SELECT, raw: true })
    .catch((err) => {
      console.error(err);
    });
  userList.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value == "object" && value != undefined) {
        elem[key] = value.toString("utf8");
      }
    }
  });

  res.render("usermanager", {
    message: "",
    err: "",
    info: info,
    rid: mb_no,
    rPage: iPage,
    rWord: iWord,
    userList: userList,
    dbconfigList: dbconfigList,
    datamodelList: datamodelList,
    user: req.session,
  });
};

exports.listUser = async (req, res, next) => {
  console.log("listUsers..");

  const url = require("url");
  const hostname = req.headers.host;
  const pathname = url.parse(req.url).pathname;
  const selfUrl = "http://" + hostname + pathname;

  let whereSql = `WHERE reg_mb_id = '${req.session.mb_id}'`;

  //전체 글 갯수 획득
  query = `SELECT count(*) as cnt FROM tb_user ${whereSql}`;
  let [rsltOne] = await sequelize
    .query(query, { type: QueryTypes.SELECT })
    .catch((err) => {
      console.error(err);
    });
  const totalCount = rsltOne.cnt;

  //전체 글 획득
  query = `SELECT *
  FROM tb_user              
  ${whereSql} 
  ORDER BY mb_no desc`;
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

exports.selectUser = async (req, res, next) => {
  console.log("selectUser.");

  const mb_no = req.params.mb_no;

  //전체 글 획득
  const query = `SELECT * FROM tb_user WHERE mb_no = ${mb_no}`;
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


exports.updateCurrentProject = async (req, res, next) => {

  console.log("updateCurrentProject");
  let info = {
    pjt_id: req.body.pjt_id,
  };
  console.log(info);

  const mb_id = req.session.mb_id;

  const result = await db.user.update(
    info,
    {
      where: {
        mb_id: mb_id,
      },
    }
  ).catch(err => { console.error(err); });

  let query =
    `SELECT tb.pjt_id, tb.pjt_code, tb.pjt_name         
    FROM tb_project tb
   WHERE pjt_id = '${req.body.pjt_id}' `;

  console.log(query);
  const rows = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
  rows.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof (value) == "object" && value != undefined) {
        elem[key] = value.toString('utf8');
      }
    }
  });
  console.log("rows=" + JSON.stringify(rows));

  res.json({
    status: '200',
    message: "수정하였습니다",
    row: rows[0],
    error: null,
  });
}


