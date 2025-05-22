CREATE TABLE `km_detect` (
	`detect_id` INT(8) NOT NULL AUTO_INCREMENT COMMENT 'ID',
	`req_id` INT(8) NOT NULL DEFAULT '0' COMMENT '요청ID',
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`board_name` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`post_url` VARCHAR(500) NOT NULL DEFAULT '' COMMENT 'URL' COLLATE 'utf8_general_ci',
	`keyword` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '키워드' COLLATE 'utf8_general_ci',
	`detect_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '감지일시',
	`detect_title` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '글제목' COLLATE 'utf8_general_ci',
	`detect_content` TEXT NOT NULL COMMENT '글내용' COLLATE 'utf8_general_ci',
	`detect_status` VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '상태' COLLATE 'utf8_general_ci',
	`after_proc` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '사후조치' COLLATE 'utf8_general_ci',
	`proc_datetime` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '조치일시',
	PRIMARY KEY (`detect_id`) USING BTREE
)
COLLATE='utf8_general_ci'
ENGINE=MyISAM
;

INSERT INTO km_detect
req_id <= config.id (config.json에 id 추가함)
req_mb_id <= config.receiver_email
board_name <= config.board_name
post_url <= config.url
keyword <= config.keyword
detect_datetime <= now()
detect_title <= detected title
detect_status <= '1' (detected)


1. table
CREATE TABLE `km_request` (
	`req_id` INT(8) NOT NULL AUTO_INCREMENT COMMENT '요청ID',
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`receiver_email` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '수신이메일' COLLATE 'utf8_general_ci',
	`req_status` VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '상태' COLLATE 'utf8_general_ci',
	`board_name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`board_type` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '게시판Type' COLLATE 'utf8_general_ci',
	`post_url` VARCHAR(500) NOT NULL DEFAULT '' COMMENT 'URL' COLLATE 'utf8_general_ci',
	`keyword` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '키워드' COLLATE 'utf8_general_ci',
	`parsing_config` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '파서설정' COLLATE 'utf8_general_ci',
	`parsing_type` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '파싱타입' COLLATE 'utf8_general_ci',
	`start_date` VARCHAR(12) NOT NULL COMMENT '시작일자' COLLATE 'utf8_general_ci',
	`end_date` VARCHAR(12) NOT NULL COMMENT '종료일자' COLLATE 'utf8_general_ci',
	`pay_type` VARCHAR(20) NOT NULL COMMENT 'Pay타입' COLLATE 'utf8_general_ci',
	`pay_amount` INT(8) NOT NULL COMMENT '금액',
	`reg_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '등록일시',
	PRIMARY KEY (`req_id`) USING BTREE,
	INDEX `index1` (`req_mb_id`) USING BTREE
)
COMMENT='요청'
COLLATE='utf8_general_ci'
ENGINE=MyISAM
AUTO_INCREMENT=6
;

2. make model, controller, rotuter for km_request table

	<sample model>
	//**********************************************/
//    @Project : alphaBot (메타봇)
//    @File : org.model.js
//    @Desc : 기관/회사 model
//    @Author : modeller77@gmail.com
//    include org.model.js to models/index.js
//**********************************************/

module.exports = (sequelize, DataTypes) => {
  const org = sequelize.define("tb_org", {
      org_id: {
        type: DataTypes.DataTypes.INTEGER(10),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        get() { return this.getDataValue('org_id'); }
      },org_name: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('org_name').toString('utf8'); }
      },area: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('area').toString('utf8'); }
      },manager_id: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('manager_id').toString('utf8'); }
      },manager_email: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('manager_email').toString('utf8'); }
      },manager_hpno: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('manager_hpno').toString('utf8'); }
      },org_status: {
        type: DataTypes.DataTypes.STRING(10),
        
        allowNull: true,
        get() { return this.getDataValue('org_status').toString('utf8'); }
      },reg_dt: {
        type: DataTypes.DataTypes.DATE,
        
        allowNull: true,
        get() { return this.getDataValue('reg_dt'); }
      },leave_dt: {
        type: DataTypes.DataTypes.DATE,
        
        allowNull: true,
        get() { return this.getDataValue('leave_dt'); }
      },
    },
    {
      freezeTableName: true,
      timestamps: false
    });
  return org;
}

	<sample router>

const orgController = require("../controllers/org.controller.js");
const router = require("express").Router();
const userAuth = require('../middlewares/auth.js').userAuth;

router.route('/getOrgs')
      .get(userAuth,orgController.getOrgs) //get request
      .post(userAuth,orgController.postOrgs) //post request

router.route('/getOrg')
      .get(userAuth,orgController.getOrg) //get request
router.route('/viewOrg')
      .post(userAuth,orgController.viewOrg) 
router.route('/deleteOrg/:org_id')
      .delete(userAuth,orgController.deleteOrg) 
router.route('/manageOrg')
      .get(userAuth, orgController.manageOrg) 
router.route('/listOrg')
      .get(userAuth, orgController.listOrg) 
router.route('/selectOrg/:org_id')
      .delete(userAuth,orgController.selectOrg) 

module.exports = router;
   
< sample controller >

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



2. make list program for km_request table
   template program

   <%-include ./user.head.ejs %>

<% var iCdTp="" ; %>

<script type="text/javascript">
  $(function () {
      $("#iCbAll").click(function () {
          if ($("#iCbAll").prop("checked")) {
            $("input[id=iCbOne]").prop("checked", true);
          } else {
            $("input[id=iCbOne]").prop("checked", false);
          }
        });
    });
  
  function search() {
    console.log("search..");
    var form = document.workForm;
    form.iPage.value = 1;
    form.method = "GET";
    form.action = "getAicodes";
    form.submit();
  }
  
  function view(ac_id) {
    var form = document.workForm;
    form.ac_id.value = ac_id;
    form.action = "viewAicode";
    form.submit();
  }
  
  function create() {
    var form = document.workForm;
    form.action = "getAicode";
    form.method = "GET";
    form.submit();
  }
  
  function procDeleteMulti() {
    if (confirm("정말 삭제하시겠습니까?") == true) {
      //확인
      var form = document.workForm;
      var cbOneArr = document.getElementsByName("iCbOne");
      var cbStr = "";
      var chkCnt = 0;
      for (var i = 0; i < cbOneArr.length; i++) {
        if (cbOneArr[i].checked) {
          chkCnt++;
          cbStr += cbOneArr[i].value + "|";
          console.log(cbOneArr[i].value);
          fetch("deleteAicode/" + cbOneArr[i].value, {
              method: "DELETE",
              mode: "same-origin",
              credentials: "same-origin",
            })
          .then((response) => {
              console.log(response.message);
            })
          .catch((error) => {
              console.log(error);
            });
        }
      }
      
      if (chkCnt > 0) {
        location.reload();
        toastr.success("삭제하였습니다.");
      } else {
        toastr.warning("삭제할 항목을 선택해주세요.");
      }
    }
  }
  
  function submitSearch() {
    document.fsearch.submit();
  }
  
  //-->
</script>

<div class="content-wrapper">
  <section class="content-header">
    <h1>
    
    <small></small>
    </h1>
    <ol class="breadcrumb">
    <li>
    <a href="#"><i class="fa fa-dashboard"></i> Home > </a>
    </li>
    <li class="active"></li>
    </ol>
  </section>
  
  <section class="content">
    <div class="row">
      <form name="workForm" method="post" action="">
      <input type="hidden" name="iPage" value="<%= rPage %>">
      <div class="box box-info">
        <div class="box-body">
          
          <div class="row pull-right ">
            <div class="box-body">
              <input type="hidden" id="iPage" name="iPage" value="<%= rPage %>">
              <input type="hidden" id="ac_id" name="ac_id" value="">
              <div class="col-md-4">
                
              </div>
              
              <!-- 검색어 입력란과 검색 버튼 -->
              <div class="col-md-4">
                <div class="form-inline">
                  <div class="input-group">
                    <input type='text' class="form-control" id="iWord" name="iWord" value="<%= rWord %>"
                    placeholder="검색어" size="100" />
                    <span class="input-group-btn">
                      <a href="#" onclick="submitSearch()" class="btn btn-info btn-md">검색</a>
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="col-md-4 text-right">
                <button type="button" onclick="create()" class="btn btn-default" id="addBtn"><i
                class="fa fa-plus"></i> 추가</button>
                <button type="button" onclick="procDeleteMulti()" class="btn btn-default" id="deleteBtn"><i
                class="fa fa-trash"></i> 삭제</button>
                
              </div>
              
            </div>
          </div>
          
          <div class="box-body">
            <table class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" name="iCbAll" id="iCbAll" class="cb-middle" />
                  </th>
                  <th>코드 ID</th>
                  <th>명칭</th>
                  <th>요구사항</th>
                  <th>Target</th>
                  <th>언어</th>
                  <th>프레임웍</th>
                  <th>모듈타입</th>
                  <th>데이터그룹ID</th>
                  <th>데이터스키마</th>
                  <th>생성된코드</th>
                  <th>파일명</th>
                  <th>프로젝트코드</th>
                  <th>학교ID</th>
                  <th>등록자</th>
                  <th>등록일시</th>
                  
                </tr>
              </thead>
              <% if(list.length) { %>
                <tbody>
                  <% for(var i in list) { %>
                    <tr>
                      <td>
                        <input type="checkbox" value="<%= list[i].ac_id %>" name="iCbOne" id="iCbOne"
                        class="cb-middle" />
                      </td>
                      
                      <td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].ac_id %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].ac_name %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].request %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].ac_target %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].ac_lang %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].ac_framework %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].ac_module_type %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].data_grp_id %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].table_schema %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].content %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].file_name %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].pjt_code %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].org_id %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].reg_mb_id %>
                      </td><td onclick="view('<%= list[i].ac_id %>')" style="cursor: pointer;">
                        <%= list[i].reg_dt %>
                      </td>
                    </tr>
                    <% } %>
                </tbody>
                <% } else { %>
                <tbody>
                  <tr>
                    <td class="text-center" colspan="6">해당자료가 없습니다</td>
                  </tr>
                </tbody>
                <% } %>
            </table>
          </div>
          
          <div class="box-footer clearfix"><%- paging %></div>
        </div>
      </div>
      </form>
    </div>
  </section>
</div>

<%-include ./user.tail.ejs %>






INSERT INTO km_request
req_id <= AUTO_INCREMENT
req_mb_id <= config.receiver_email
receiver_email <= config.receiver_email
post_url <= config.url
board_type <= config.board_type
board_name <= config.board_name
keyword <= config.keyword
parsing_config <= config.parsing_config
parsing_type <= config.parsing_config.parsing_type
req_status <= config.status
start_date <= config.start_date
end_date <= config.end_date
