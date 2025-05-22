const jwt = require("../modules/jwt.js");
const bcrypt = require("bcrypt");
const { sequelize } = require("../models/index.js");
const { QueryTypes } = require("sequelize");
const db = require("../models/index.js");
const nodemailer = require("nodemailer");
const fs = require("fs");
const commonLib = require("../modules/common.lib.js");
const { v4: uuidv4 } = require("uuid");
const user = db.user;
const logger = require("../logger");
const { Op } = require("sequelize");

exports.test1 = (req, res, next) => {
  logger.info("user controller test..");
  res.render("test1", { user: "" });
};

//authentication check
exports.authentication = (req, res, next) => {
  if (req.session.mb_id != undefined) {
    next();
  } else {
    res.render("home", { user: "" });
  }
};

// show the home page
exports.getHome = (req, res, next) => {
  logger.info("getHome..");
  if (req.session.mb_id != undefined) {
    return res.render("login", { user: req.session.mb_id });
  } else {
    return res.render("login", { user: "" });
  }
};

// show the home page
exports.getTest = (req, res, next) => {
  return res.render("test", { user: req.session.mb_id });
};

exports.getMain = (req, res, next) => {
  logger.info("getMain..");
  if (req.session.mb_id != undefined) {
    return res.render("usermain", { user: req.session });
  } else {
    return res.render("usermain", { user: "" });
  }
};

exports.getLogin = (req, res, next) => {
  res.render("login", { user: "", message: [], err: [] });
};

exports.postLogin = async (req, res, next) => {
  logger.info("postLogin" + JSON.stringify(req.body));

  const { mb_id, mb_password } = req.body;

  const saltRounds = 10;
  const passwordSql = `SELECT mb_password2 FROM tb_user WHERE mb_id = :mb_id`;

  try {
    const row = await sequelize.query(passwordSql, {
      type: QueryTypes.SELECT,
      replacements: { mb_id: mb_id },
    });

    logger.debug("row=" + JSON.stringify(row));

    let savedPassword = row[0].mb_password2;

    if (Buffer.isBuffer(savedPassword)) {
      savedPassword = savedPassword.toString('utf8');
    }

    console.log("savedPassword(JSON) =", JSON.stringify(savedPassword));
    console.log("mb_password2=" + mb_password);

    // savedPassword가 문자열인지 확인
    if (typeof savedPassword !== 'string') {
      return res.status(500).json({
          status: 'error',
          message: '저장된 비밀번호 형식이 잘못되었습니다.'
      });
    }

    try {
      const isMatch = await bcrypt.compare(mb_password.trim(), savedPassword);

      if (isMatch) {
        logger.info("비밀번호가 일치합니다.");
      } else {
        logger.info("비밀번호가 일치하지 않습니다.");
        res.status(400).json({
          status: "400",
          message: "아이디 혹은 비밀번호 오류입니다.",
        });
        return;
      }
    } catch (error) {
      console.error("비밀번호 검증 중 오류 발생:", error);
      res.status(500).json({
        status: "500",
        message: "서버 에러가 발생했습니다.",
      });
      return;
    }

    const sql = `SELECT mb_id, mb_email, mb_password2, mb_name, mb_level, org_id, org_name, site_id, pjt_id, email_verified, mb_level,
                  ifnull(mb_leave_date, '') mb_leave_date, ifnull(mb_intercept_date, '') mb_intercept_date  
                  FROM tb_user WHERE mb_id = :mb_id `;

    const [user] = await sequelize
      .query(
        sql,
        { replacements: { mb_id: mb_id } },
        { type: QueryTypes.SELECT, raw: true }
      )
      .catch((err) => {
        console.error(err);
      });

    if (user.length) {
      user.map(function (elem) {
        for (const [key, value] of Object.entries(elem)) {
          if (typeof value == "object" && value != undefined) {
            elem[key] = value.toString("utf8");
          }
        }
      });
      logger.debug("user=" + JSON.stringify(user[0]));

      if (user[0].email_verified != "Y") {
        res.status(400).json({
          status: 400,
          message: "이메일 인증이 필요합니다.",
        });
        return;
      }
      if (user[0].mb_level < "2") {
        res.status(400).json({
          status: 400,
          message: "아이디가 승인 이전입니다. 관리자에게 문의하세요.",
        });
        return;
      }
      if (user[0].mb_leave_date != "" || user[0].mb_intercept_date != "") {
        res.status(400).json({
          status: 400,
          message: "탈퇴한 아이디 입니다.",
        });
        return;
      }

      logger.info("login success..");
      const jwtToken = await jwt.sign(user);
      jwt.accessToken[user[0].mb_id] = jwtToken.token;

      req.session.mb_id = user[0].mb_id;
      req.session.mb_name = user[0].mb_name;
      req.session.mb_email = user[0].mb_email;
      req.session.org_name = user[0].org_name;
      req.session.site_id = user[0].site_id;
      req.session.mb_type = user[0].mb_type;
      req.session.mb_level = user[0].mb_level;
      req.session.loggedIn = true;
      req.session.org_id = user[0].org_id;
      req.session.pjt_id = user[0].pjt_id;
      res.cookie("token", jwtToken.refreshToken);
      logger.info("postLogin..");
      //res.render('aiqueryform', { user: req.session, message: "", err: "", resultRows: [] });
      res.status(200).json({
        status: 200,
        message: "로그인 하였습니다.",
      });
      logger.debug(req.session);
    } else {
      logger.info("Check loginID & password..");
      res.status(400).json({
        status: 400,
        message: "로그인이 실패 하였습니다.",
      });
    }
  } catch (error) {
    console.error("비밀번호 검증 중 오류 발생:", error);
    res.status(500).json({
      status: "500",
      message: "서버 에러가 발생했습니다.",
    });
    return;
  }
};

exports.getUpload = (req, res, next) => {
  res.render("getUpload", { user: req.session, message: [], err: [] });
};

exports.postUpload = async (req, res, next) => {
  logger.info("postChangePassword=" + JSON.stringify(req.body));
  const { mb_id, old_password, new_password } = req.body;
};

exports.getChangePassword = (req, res, next) => {
  res.render("changepassword", { user: req.session, message: [], err: [] });
};

exports.postChangePassword = async (req, res, next) => {
  logger.info("postChangePassword=" + JSON.stringify(req.body));
  const { mb_id, new_password } = req.body;

  const saltRounds = 10;
  // const passwordSql = `SELECT mb_password2 FROM tb_user WHERE mb_id = :mb_id`;

  // try {
  //    const savedPasswords = await sequelize.query(passwordSql, {
  //       type: QueryTypes.SELECT,
  //       replacements: { mb_id: mb_id }
  //    });

  //    const savedPassword = savedPasswords[0].mb_password2; // 첫 번째 요소의 mb_password 속성
  //    logger.info("savedPassword=" + savedPassword);

  //    const isMatch = await bcrypt.compare(old_password, savedPassword);
  //    if (isMatch) {
  //       logger.info("비밀번호가 일치합니다.");
  //    } else {
  //       logger.info("비밀번호가 일치하지 않습니다.");
  //       res.status(400).json({
  //          status: "400",
  //          message: "기존 비밀번호 오류입니다."
  //       });
  //       return;
  //    }
  // } catch (error) {
  //    console.error("비밀번호 검증 중 오류 발생:", error);
  //    res.status(500).json({
  //       status: "500",
  //       message: "서버 에러가 발생했습니다."
  //    });
  //    return;
  // }

  const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

  const sql = `UPDATE tb_user SET mb_password2 = '${hashedNewPassword}'  WHERE mb_id = '${mb_id}'`;
  await sequelize.query(sql).catch((err) => {
    logger.error("err=" + err);
    if (err) {
      console.error("Error occurred", err);
      return res.status(500).send("Error occurred");
    }
  });

  logger.info("Changepassword success");
  res.status(200).json({
    status: "200",
    message: "비밀번호를 변경하였습니다.",
  });
};

exports.getCreateAccount = (req, res, next) => {
  res.render("createAccount", { user: "", message: [], err: [] });
};

exports.postCreateAccount = async (req, res, next) => {
  logger.info("createAccount=" + JSON.stringify(req.body));
  const { mb_email, mb_name, mb_password, mb_password_again, org_name } =
    req.body;

  if (
    !mb_email ||
    !mb_name ||
    !mb_password ||
    !mb_password_again ||
    !org_name
  ) {
    return res.status(400).json({
      status: "400",
      message: "모든 필드를 입력해주세요.",
    });
  }

  if (mb_password !== mb_password_again) {
    // if passwords don't match
    return res.status(400).json({
      status: "400",
      message: "비밀번호와 재입력이 일치하지 않습니다.",
    });
  }

  try {
    const cnt = await db.user.count({
      where: { mb_email },
    });

    if (cnt > 0) {
      return res.status(400).json({
        status: "400",
        message: "이미 사용중인 이메일 입니다.",
      });
    }

    const org_id = "2"; //소속미정
    const verificationToken = uuidv4();
    const saltRounds = 10; // 또는 보안 요구에 맞게 조정
    const hashedPassword = await bcrypt.hash(mb_password, saltRounds);
    const mb_type = "developer";

    await sequelize.query(
      `INSERT INTO tb_user 
                (mb_id, mb_email, mb_password2, mb_name, org_name, mb_type, mb_level, email_verified, verify_token, org_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          mb_email,
          mb_email,
          hashedPassword,
          mb_name,
          org_name,
          mb_type,
          "2",
          "N",
          verificationToken,
          org_id,
        ],
      }
    );

    logger.info("Join success");
    res.status(200).json({
      status: "200",
      message:
        "이메일로 인증링크를 발송하였습니다. 인증해주세요. (Successfully registered, you need to verify your email. Check your email.)",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const rootUrl = `${req.protocol}://${req.get("host")}`;
    const verificationLink = `${rootUrl}/verify?token=${verificationToken}`;
    const html = `
            <h1>Verify Your Email</h1>
            <p>Dear ${mb_name},</p>
            <p>Thank you for joining our application. Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">Verify Email</a>
        `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: mb_email,
      subject: "Verify your email - FROM alphaBot",
      html: html,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        logger.error("Error sending email:", error);
      } else {
        logger.info("Email sent:", info.response);
      }
    });
  } catch (err) {
    console.error("Error occurred", err);
    return res.status(500).json({
      status: "500",
      message: "Error occurred",
    });
  }
};

exports.checkGoogleAccount = async (req, res) => {
  console.log("checkGoogleAccount..");
  const { google_id, mb_name, mb_email, mb_photo } = req.body;

  try {
    const sqlCount = `SELECT COUNT(*) as cnt FROM tb_user WHERE mb_id = :mb_id OR google_id = :google_id`;

    const [countResult] = await sequelize.query(sqlCount, {
      replacements: { mb_id: mb_email, google_id: google_id },
      type: QueryTypes.SELECT,
      raw: true,
    });

    console.log("Query result:", countResult);

    if (countResult.cnt == "0") {
      let info = {
        mb_id: mb_email,
        google_id: google_id,
        mb_name: mb_name,
        mb_email: mb_email,
        mb_type: "developer",
        mb_level: "2",
        email_verified: "Y",
        email_varify_date: sequelize.fn("now"),
        mb_open_date: sequelize.fn("now"),
        mb_photo: mb_photo,
      };

      const newUser = await db.user.create(info).catch((err) => {
        console.error("Error creating new user:", err);
      });
      console.log("newUser:", newUser);
    }

    const sqlUser = `SELECT mb_id, mb_email, mb_name, mb_level, org_id, org_name, site_id, pjt_id, email_verified, mb_level,
    ifnull(mb_leave_date, '') mb_leave_date, ifnull(mb_intercept_date, '') mb_intercept_date  
    FROM tb_user WHERE mb_id = :mb_id`;

    const userResult = await sequelize.query(sqlUser, {
      replacements: { mb_id: mb_email },
      type: QueryTypes.SELECT,
      raw: true,
    });

    console.log("User query result:", userResult);

    if (userResult && userResult.length > 0) {
      const user = userResult[0];
      userResult.map(function (elem) {
        for (const [key, value] of Object.entries(elem)) {
          if (typeof value == "object" && value != undefined) {
            elem[key] = value.toString("utf8");
          }
        }
      });

      logger.debug("user:", JSON.stringify(user));

      if (user.mb_level < "2") {
        return res.status(400).json({
          status: 400,
          message: "아이디가 승인 이전입니다. 관리자에게 문의하세요.",
        });
      }
      if (user.mb_leave_date != "" || user.mb_intercept_date != "") {
        return res.status(400).json({
          status: 400,
          message: "탈퇴한 아이디 입니다.",
        });
      }

      logger.info("login success..");
      const jwtToken = await jwt.sign(user);
      jwt.accessToken[user.mb_id] = jwtToken.token;

      req.session.mb_id = user.mb_id;
      req.session.mb_name = user.mb_name;
      req.session.mb_email = user.mb_email;
      req.session.org_name = user.org_name;
      req.session.site_id = user.site_id;
      req.session.mb_type = user.mb_type;
      req.session.mb_level = user.mb_level;
      req.session.loggedIn = true;
      req.session.org_id = user.org_id;
      req.session.pjt_id = user.pjt_id;
      res.cookie("token", jwtToken.refreshToken);

      return res.redirect("/getAicode");
    } else {
      console.error("User not found after creation.");
      res.status(500).json({
        status: 500,
        message: "Internal server error: user not found after creation.",
      });
    }
  } catch (err) {
    console.error("Error in checkGoogleAccount:", err);
    res.redirect("/");
  }
};


exports.verify = async (req, res) => {
  var cnt = await db.user.count({
    where: { verify_token: req.query.token, email_verified: "Y" },
  });
  if (cnt != "0") {
    return res.render("verifyresult", {
      status: "200",
      message: "이메일이 이미 인증되었습니다.",
    });
  }

  cnt = await db.user.count({
    where: { verify_token: req.query.token, email_verified: "N" },
  });

  if (cnt == "1") {
    logger.info("verified..");
    const sql = `UPDATE tb_user SET email_verified = 'Y', verify_token='done', email_verify_date = now() WHERE verify_token='${req.query.token}'`;
    logger.debug(sql);
    const code = await sequelize.query(sql).catch((err) => {
      logger.error("err=" + err);
      if (err) {
        console.error("Error occurred", err);
        return res.status(500).send("Error occurred");
      }
    });
    return res.render("verifyresult", {
      status: "200",
      message: "이메일 인증이 성공하였습니다.",
    });
  } else {
    return res.render("verifyresult", {
      status: "200",
      message: "이메일 인증이 실패하였습니다.",
    });
  }
};

exports.getresetPassword = async (req, res) => {
  logger.info("getresetPassword=");
  const token = req.query.token;
  var cnt = await db.mailcert.count({
    where: { token: token, status: "send" },
  });

  if (cnt == "0") {
    res.status(400).json({
      status: "400",
      message: "Invalid access",
    });
    return;
  }

  const sql = `SELECT mb_email, token
         FROM tb_mail_cert 
        WHERE token = '${token}' 
          AND status = 'send'
          AND reg_dt > DATE_SUB(NOW(), INTERVAL 1 HOUR);`;
  logger.debug(sql);
  const [row] = await sequelize.query(sql).catch((err) => logger.error(err));
  if (row == null) {
    res.status(400).json({
      status: "400",
      message: "해당 자료가 없습니다.",
    });
    return;
  }
  row.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value == "object") {
        elem[key] = value.toString("utf8");
      }
    }
  });
  logger.debug(row[0]);
  res.render("resetpassword", { info: row[0], message: [], err: [] });
};

exports.postresetPassword = async (req, res) => {
  logger.info("postresetPassword");
  const { mb_password, token, mb_email } = req.body;
  logger.debug(
    "postresetPassword=" + mb_password + ", " + token + ", " + mb_email
  );

  // Generate a salt with 10 rounds
  const saltRounds = 10;
  let success = true;

  // Hash the plain text password using bcrypt
  bcrypt.hash(mb_password, saltRounds, async (err, hash) => {
    if (err) {
      console.error("Error while hashing password:", err);
      res.status(500).json({
        status: "500",
        message: "Internal server error.",
      });
      return;
    }

    try {
      let sql = `UPDATE tb_user SET mb_password2 = ? WHERE mb_email = ?`;

      try {
        await sequelize.query(sql, { replacements: [hash, mb_email] });

        logger.info("Password updated successfully.");
      } catch (error) {
        console.error("Error while updating password:", error);
        success = false;
        res.status(500).json({
          status: "500",
          message: "서버 에러입니다.",
        });
        return;
      }

      const isMatch = await bcrypt.compare(mb_password, hash);
      if (isMatch) {
        logger.info("match success..");
      } else {
        logger.info("match fail..");
      }

      sql = `UPDATE tb_mail_cert SET status = 'complete' WHERE token = '${token}'`;
      await sequelize.query(sql).catch((err) => {
        logger.error("err=" + err);
        if (err) {
          console.error("Error occurred", err);
          success = false;
          res.status(500).json({
            status: "500",
            message: "서버 에러입니다.",
          });
          return;
        }
      });

      logger.info("Password hashed and stored successfully.");
    } catch (error) {
      console.error("Error while storing password:", error);
      success = false;
      res.status(500).json({
        status: "500",
        message: "서버 에러입니다.",
      });
      return;
    }

    res.status(200).json({
      status: "200",
      message: "비밀번호를 변경하였습니다.",
    });
  });
};

exports.getfindPassword = async (req, res) => {
  res.render("findpassword", { user: "", message: [], err: [] });
};

exports.postfindPassword = async (req, res) => {
  logger.info("postfindPassword=" + req.body.mb_email);
  const mb_email = req.body.mb_email;
  var cnt = await db.user.count({
    where: { mb_email: mb_email },
  });

  logger.debug("cnt=" + cnt);

  if (cnt == "0") {
    res.status(400).json({
      status: "400",
      message: "등록된 이메일이 아닙니다.",
    });
    return;
  }
  var sql = `SELECT mb_email, mb_name, mb_level, ifnull(mb_leave_date, '') mb_leave_date, ifnull(mb_intercept_date, '') mb_intercept_date  
      FROM tb_user 
     WHERE mb_email = '${mb_email}'`;
  logger.debug(sql);
  const [user] = await sequelize.query(sql).catch((err) => logger.info(err));

  if (user == null) {
    res.status(400).json({
      status: "400",
      message: "해당 자료가 없습니다.",
    });
    return;
  }
  user.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value == "object") {
        elem[key] = value.toString("utf8");
      }
    }
  });

  logger.debug(user);
  const mb_level = parseInt(user[0].mb_level);
  if (
    mb_level < 2 ||
    user[0].mb_leave_date != "" ||
    user[0].mb_intercept_date != ""
  ) {
    res.status(400).json({
      status: "400",
      message: "승인 이전 혹은 탈퇴한 계정입니다.",
    });
    return;
  }

  const resetToken = uuidv4();
  sql = `INSERT INTO tb_mail_cert (mb_email, type, token, status, reg_dt)
   VALUES ('${mb_email}', 'reset', '${resetToken}', 'send', now() )`;
  await sequelize.query(sql).catch((err) => {
    logger.error("err=" + err);
    if (err) {
      console.error("Error occurred", err);
      return res.status(400).json({
        status: "400",
        message: "Error occurred",
      });
    }
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "modeller77@gmail.com",
      pass: "zosgervjaoockvrb",
    },
  });
  const rootUrl = `${req.protocol}://${req.get("host")}`;
  const resetUrl = `${rootUrl}/resetpassword?token=${resetToken}`;
  var html = `비밀번호를 재설정하려면 다음 링크을 클릭하세요.\n${resetUrl}\nfrom alphaBot\n`;

  const mailOptions = {
    from: "modeller77@gmail.com",
    to: mb_email,
    subject: "비밀번호 재설정",
    text: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error("Error sending email:", error);
    } else {
      logger.info("Email sent:", mb_email);
    }
  });

  res.status(200).json({
    status: "200",
    message: "비밀번호 재설정 링크를 이메일로 발송하였습니다.",
  });
};

exports.viewAgreement = (req, res, next) => {
  const type = req.params.type;

  if (type == "privacy") {
    res.render("/public/content/privacy.html");
  }
  if (type == "terms") {
    res.render("/public/content/terms.html");
  }
};

exports.viewManual = (req, res, next) => {
  var projectJson = "";
  var datamodelJson = "";
  var appmodelJson = "";

  var filepath = "./public/sample/project.json";
  var filename = filepath.substring(filepath.lastIndexOf("/") + 1);
  fs.readFile(filepath, "utf8", (err, projectJson) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading file.");
    }
    filepath = "./public/sample/user.datamodel.json";
    filename = filepath.substring(filepath.lastIndexOf("/") + 1);
    fs.readFile(filepath, "utf8", (err, datamodelJson) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error reading file.");
      }
      filepath = "./public/sample/user.appmodel.json";
      filename = filepath.substring(filepath.lastIndexOf("/") + 1);
      fs.readFile(filepath, "utf8", (err, appmodelJson) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error reading file.");
        }
        res.render("manual", {
          projectJson: projectJson,
          datamodelJson: datamodelJson,
          appmodelJson: appmodelJson,
        });
      });
    });
  });
};

exports.getUser = async (req, res, next) => {
  logger.info("getUser");
  let info = {};

  res.render("userform", {
    user: req.session,
    message: "",
    err: "",
    info: info,
  });
};

exports.viewUser = async (req, res, next) => {
  const mb_id = req.session.mb_id;
  logger.info("viewUser " + mb_id);

  let query = `SELECT user.mb_no, user.mb_id, user.mb_name, user.mb_level, user.mb_type, user.mb_nick,
                       user.mb_email, user.mb_hp, user.dept_name, user.org_id, user.pjt_id,
                       DATE_FORMAT(user.mb_open_date,'%Y-%m-%d') as mb_open_date, 
                       DATE_FORMAT(user.email_verify_date, '%Y-%m-%d') AS email_verify_date,
                       org.org_name as org_id_name, cd.cd_nm mb_level_name
                  FROM tb_user user 
                  LEFT JOIN tb_org org ON org.org_id = user.org_id
                  LEFT JOIN tb_code cd ON cd.cd_tp = 'mb_level' AND cd.cd_cd = user.mb_level
                WHERE user.mb_id = '${mb_id}'`;
  const row = await sequelize
    .query(query, { type: QueryTypes.SELECT, raw: true })
    .catch((err) => {
      console.error(err);
    });
  if (row == null) {
    res.status(400).json({
      status: "400",
      message: "해당 자료가 없습니다.",
    });
    return;
  }
  row.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value == "object" && value != undefined) {
        elem[key] = value.toString("utf8");
      }
    }
  });
  logger.debug("row=" + JSON.stringify(row[0]));
  res.render("profile", {
    user: req.session,
    message: "",
    err: "",
    info: row[0],
    rPage: "0",
  });
};

exports.updateUser = async (req, res, next) => {
  logger.info("accountController updateUser patch");
  let info = {
    mb_name: req.body.mb_name,
    site_id: req.body.site_id,
    mb_nick: req.body.mb_nick,
    mb_type: req.body.mb_type,
    mb_level: req.body.mb_level,
    mb_email: req.body.mb_email,
    mb_status: req.body.mb_status,
    mb_hp: req.body.mb_hp,
    org_id: req.body.org_id,
    dept_name: req.body.dept_name,
  };
  logger.debug(info);

  const mb_id = req.body.mb_id;

  const result = await user
    .update(info, {
      where: {
        mb_id: mb_id,
      },
    })
    .catch((err) => {
      console.error(err);
    });

  res.json({
    status: "200",
    message: "수정하였습니다",
  });
};

exports.selectUser = async (req, res, next) => {
  logger.info("selectUser..");

  const mb_id = req.params.mb_id;

  //전체 글 획득
  const query = `SELECT * FROM tb_user WHERE mb_id = '${mb_id}'`;
  logger.debug(query);
  const rows = await sequelize
    .query(query, { type: QueryTypes.SELECT, raw: true })
    .catch((err) => {
      console.error(err);
    });
  if (rows == null) {
    res.status(400).json({
      status: "400",
      message: "해당 자료가 없습니다.",
    });
    return;
  }
  rows.map(function (elem) {
    for (const [key, value] of Object.entries(elem)) {
      if (typeof value == "object" && value != undefined) {
        elem[key] = value.toString("utf8");
      }
    }
  });
  res.json(rows[0]);
};

exports.getSession = (req, res, next) => {
  res.json(req.session);
};

exports.logout = (req, res, next) => {
  req.session.destroy();
  res.render("login", { user: "" });
};
