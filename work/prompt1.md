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

CREATE TABLE `km_detect` (
	`detect_id` INT(8) NOT NULL AUTO_INCREMENT COMMENT 'ID',
	`req_id` INT(8) NOT NULL DEFAULT '0' COMMENT '요청ID',
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`board_name` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`post_url` VARCHAR(500) NOT NULL DEFAULT '' COMMENT 'URL' COLLATE 'utf8_general_ci',
	`keyword` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '키워드' COLLATE 'utf8_general_ci',
	`detect_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '감지일시',
	`post_title` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '글제목' COLLATE 'utf8_general_ci',
	`post_content` TEXT NOT NULL COMMENT '글내용' COLLATE 'utf8_general_ci',
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
post_title <= detected title
detect_status <= '1' (detected)


1. table
CREATE TABLE `km_job_log` (
	`log_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '로그ID',
	`req_id` INT(8) NOT NULL COMMENT '요청ID',
	`board_name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`status` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '상태코드' COLLATE 'utf8_general_ci',
  `result` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '결과' COLLATE 'utf8_general_ci',
	`post_cnt` INT(8) NOT NULL COMMENT '게시물건수',
	`new_cnt` INT(8) NOT NULL COMMENT '신규건수',
	`reg_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '등록일시',
	PRIMARY KEY (`log_id`) USING BTREE	
)
COMMENT='작업로그'
COLLATE='utf8_general_ci'
ENGINE=MyISAM
AUTO_INCREMENT=6
;

CREATE TABLE `km_finder_run` (
	`run_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '로그ID',
	`run_date` VARCHAR(10) NOT NULL DEFAULT '' COMMENT '날짜' COLLATE 'utf8_general_ci',
	`run_cnt` INT(8) NOT NULL COMMENT '실행횟수',
	`run_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '등록일시',
	PRIMARY KEY (`run_id`) USING BTREE
)
COMMENT='파인터실행모니터'
COLLATE='utf8_general_ci'
ENGINE=MyISAM
AUTO_INCREMENT=1
;
2. make model, controller, rotuter for km_request table

	<sample model>
//**********************************************/
//    @Project : keywordmonitor
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

const kmRequestController = require("../controllers/km_request.controller.js");
const router = require("express").Router();
const userAuth = require('../middlewares/auth.js').userAuth;

router.route('/getRequests')
      .get(userAuth, kmRequestController.getRequests)
      .post(userAuth, kmRequestController.postRequests)

router.route('/getRequest')
      .get(userAuth, kmRequestController.getRequest)
router.route('/viewRequest')
      .post(userAuth, kmRequestController.viewRequest)
router.route('/addRequest')
      .post(userAuth, kmRequestController.addRequest)
router.route('/updateRequest')
      .patch(userAuth, kmRequestController.updateRequest)
router.route('/deleteRequest/:req_id')
      .delete(userAuth, kmRequestController.deleteRequest)
router.route('/listRequests')
      .get(userAuth, kmRequestController.listRequests)
router.route('/selectRequest/:req_id')
      .get(userAuth, kmRequestController.selectRequest)

module.exports = router;   
< sample controller >

//**********************************************/
//   @Project : keywordmonitor
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


< sample form program >

<%- include ./user.head.ejs %>
  <%- include inc/htmlTemplate.ejs %>

    <script type="text/javascript">

      function clearRequest() {
        $("#ac_name").val("");
        $("#request").val("");
        $("#table_schema").val("");
        $("#content").val("");
      }

      function setSampleData(type) {
        $("#sampledataModal").modal("show");
      }

      function guide() {
        window.open("/guide", "_blank");
      }

      function copyContent() {
        if (!$.trim($("#content").val())) {
          $("#content").focus();
          alert("내용이 없습니다.");
          return false;
        }
        var content = document.getElementById("content");
        content.select();
        document.execCommand("copy");
        alert("Code를 복사하였습니다");
      }

      function downloadContent() {
        if (!$.trim($("#content").val())) {
          $("#content").focus();
          alert("내용이 없습니다.");
          return false;
        }
        var text = $('#content').val();
        var request = $('#request').val();
        var fname = request.substring(0, 20).trim();
        if (!fname) fname = "download";
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fname + ".txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      function requestGenerate() {
        console.log("requestGenerate..");

        if (!$("#request").val()) {
          $("#request").focus();
          alert("요구사항을 입력하세요.");
          return false;
        }

        var form = document.workForm;
        event.preventDefault();
        $("#infering").show();
        $("#content").val("");
        const formData = new URLSearchParams(new FormData(document.workForm));
        console.log("formData=" + formData);
        fetch("generateAicode", {
          method: "POST",
          mode: "same-origin",
          credentials: "same-origin",
          body: formData,
        }).then((res) => {
          res
            .json()
            .then((response) => {
              console.log("response=" + JSON.stringify(response));
              if (response.status == 200) {
                //toastr.success("등록하였습니다");
                console.log(response.message);
                $("#content").val(response.content);
              } else {
                toastr.warning(response.message);
                console.log(response.message);
                return;
              }
            })
            .catch((error) => {
              $("#infering").hide();
              toastr.error("에러가 발생 하였습니다.");
              console.log(error);
            })
            .finally(() => {
              $("#infering").hide();
            });
        });
      }

      function update() {
        $('input[type!="hidden"][required], textarea[required]').each(function () {
          if (!$(this).val()) {
            $(this).focus();
            alert(`${$(this).attr("name")}은(는) 필수 입력 항목입니다.`);
            return false;
          }
        });

        event.preventDefault();
        const formData = new URLSearchParams(new FormData(document.workForm));
        fetch("/addAicode", {
          method: "POST",
          mode: "same-origin",
          credentials: "same-origin",
          body: formData,
        })
          .then((res) => res.json())
          .then((response) => {
            if (response.status == 200) {
              toastr.success("등록하였습니다");
            } else {
              toastr.warning(response.message);
            }
          })
          .catch((error) => {
            toastr.error("에러가 발생 하였습니다.");
          });
      }


      function getDataModelTree() {

        console.log("getDatamodelTree..");
        fetch(`/getDatamodelTree`, {
          method: "GET",
          mode: "same-origin",
          credentials: "same-origin",
        })
          .then(response => response.json())
          .then(data => {
            if (!data) {
              alert("테이블 정보가 없습니다.");
              return;
            }
            console.log(JSON.stringify(data));
            $('#treeview').jstree({
              'core': {
                'data': data
              }
            });
            $('#treeview').jstree(true).settings.core.data = data;
            $('#treeview').jstree(true).refresh();
          })
          .catch(error => {
            toastr.error('조회중 에러가 발생하였습니다.' + error);
            console.log('조회중 에러가 발생하였습니다.', error);
          });
      }

      var currentPjt = { pjt_id: "", pjt_code: "", pjt_name: "" };

      function getCurrentPjt() {
        console.log("getCurrentPjt=");

        fetch(`/listPjtcode`, {
          method: "GET",
          mode: "same-origin",
          credentials: "same-origin",
        })
          .then(response => response.json())
          .then(data => {
            console.log('listPjtcode=' + JSON.stringify(data));

            $.each(data, function (index, Pjtcode) {
              if (Pjtcode.pjt_id == Pjtcode.current_pjt_id) {
                currentPjt.pjt_id = Pjtcode.pjt_id;
                currentPjt.pjt_code = Pjtcode.pjt_code;
                currentPjt.pjt_name = Pjtcode.pjt_name;
              }
            });
            $("#current_pjt_id").val(currentPjt.pjt_id);
            $("#current_pjt_name").val(currentPjt.pjt_name);

          })
          .catch(error => console.error('Error fetching data:', error));
      }

      $(document).ready(function () {

        getCurrentPjt();

        $('input[type!="hidden"]:empty, textarea:empty').each(function () {
          //$(this).val("Sample Data");
        });

        $("#request").val("Write program code ");
        fillTargetSelectBox(targetlist);
        fillLanguageSelectBox(languagelist);
        fillFrameworkSelectBox(frameworklist);
        setupTargetSelectBoxListener();
        setupFrameworkSelectBoxListener();
        setInitialComponentSelectbox();


        $("#listContainer li").on("click", function () {
          let selectedValue = $(this).text();
          $("#ac_name").val("acode" + selectedValue.substring(0, 1));
          $("#request").val(selectedValue);
          $("#content").val("");
          $("#sampledataModal").modal("hide");
        });

      });


      function list() {
        var form = document.workForm;
        form.method = "GET";
        form.action = "/getAicodes";
        form.submit();
      }

      var targetlist = ["function", "logic", "component"];

      function fillTargetSelectBox(list) {
        var selectBox = document.getElementById('target');

        list.forEach(function (item) {
          var option = document.createElement('option');
          option.value = item;
          option.text = item;
          selectBox.appendChild(option);
        });
      }

      var languagelist = ["java", "javascript/html/css", "csharp", "sql"];

      function fillLanguageSelectBox(list) {
        var selectBox = document.getElementById('language');

        list.forEach(function (item) {
          var option = document.createElement('option');
          option.value = item;
          option.text = item;
          selectBox.appendChild(option);
        });
      }

      var frameworklist = ["springboot", "vuejs", "nodejs", "ejs"];

      function fillFrameworkSelectBox(list) {
        var selectBox = document.getElementById('framework');

        list.forEach(function (item) {
          var option = document.createElement('option');
          option.value = item;
          option.text = item;
          selectBox.appendChild(option);
        });
      }

      function setupTargetSelectBoxListener() {
        var selectBox = document.getElementById('target');
        var frameworkDiv = document.getElementById('frameworkDiv');
        var languageDiv = document.getElementById('language');
        var languageLabelDiv = document.getElementById('languageLabel');

        selectBox.addEventListener('change', function () {
          if (selectBox.value === 'component') {
            frameworkDiv.style.display = 'block';
            languageDiv.style.visibility = 'hidden';
            languageLabelDiv.style.visibility = 'hidden';
          } else {
            frameworkDiv.style.display = 'none';
            languageDiv.style.visibility = 'visible';
            languageLabelDiv.style.visibility = 'visible';
          }
        });
      }


      function setupFrameworkSelectBoxListener() {
        var $selectBox = $('#framework');
        var $componentSelectBox = $('#module_type');

        $selectBox.on('change', function () {
          console.log("framework select=" + $selectBox.val());

          if ($selectBox.val()) {
            var list = getTypelist($selectBox.val());

            $componentSelectBox.empty();

            $.each(list, function (index, item) {
              console.log("type=" + item.type);
              var $option = $('<option></option>').val(item.type).text(item.type);
              $componentSelectBox.append($option);
            });
          } else {
            $componentSelectBox.empty();
          }
        });
      }

      function setInitialComponentSelectbox() {
        var $componentSelectBox = $('#module_type');
        var list = getTypelist("springboot");
        $componentSelectBox.empty();
        $.each(list, function (index, item) {
          console.log("type=" + item.type);
          var $option = $('<option></option>').val(item.type).text(item.type);
          $componentSelectBox.append($option);
        });

      }

      function getTypelist(framework) {

        if (framework == 'vuejs') {
          var typeList = [
            { type: "list" },
            { type: "create" },
            { type: "edit" },
            { type: "delete" },
            { type: "DataService" },
            { type: "router" },
          ];
          return typeList;

        } else if (framework == 'springboot') {

          var typeList = [

            { type: "Controller" },
            { type: "DAO" },
            { type: "VO" },
            { type: "Mapper" },
            { type: "Service" },
            { type: "ServiceImpl" },
            { type: "sqlmap" },
            { type: "sqlmapconfig" },
            { type: "sql-mapper-config" },
          ];

          return typeList;

        } else if (framework == 'springquery') {
          var typeList = [
            { type: "sqlmapper", name: "ProductMapper.java", url: "ProductMapper.js" },
            { type: "controller", name: "ProductController.java", url: "ProductController.java" },
            { type: "service", name: "ProductService.java", url: "ProductService.java" },
          ];
          return typeList;
        } else if (framework == 'nodejs') {
          var typeList = [
            { type: "model" },
            { type: "controller" },
            { type: "router" },
          ];
          return typeList;
        } else if (framework == 'ejs') {
          var typeList = [
            { type: "list" },
            { type: "form" },
            { type: "view" },
          ];
          return typeList;
        }
      }

      function getColumnInfo(pid) {

        console.log("getColumnInfo=" + pid);
        fetch(`/getColumnInfo/${pid}`, {
          method: "GET",
          mode: "same-origin",
          credentials: "same-origin",
        })
        fetch(`/getColumnInfo/${pid}`, {
          method: "GET",
          mode: "same-origin",
          credentials: "same-origin",
        })
          .then(response => response.json())
          .then(row => {
            console.log(row.data);
            const columns = JSON.parse(row.data);
            let html = '<ul>';
            columns.forEach(column => {
              html += `<li class="column-item" data-column="${column.column}" 
        data-column-name="${column.column_comment}" style="cursor:pointer;">
          ${column.seq}) ${column.column_comment}
          <a href="javascript:setField( 'fld', '${row.db_name}.${row.table_id}', '${column.column}')">
            <i class="fa fa-paste" title="데이터스키마에 붙여넣기"></i></a>    
        </li>`;

            });
            html += '</ul>';
            console.log(html);
            $('#columnTableNameDiv').html(row.table_name);
            $('#columnInfoDiv').html(html);
          })
          .catch(err => {
            console.error('에러가 발생하였습니다.', err);
          });

      }


      function setField(type, table, col) {
        console.log(`setField=${type}, ${table}, ${col}`);
        let item = table.split(".")[1] + "." + col;
        if (type == "fld") {
          let val = $("#table_schema").val();
          if (val.includes(item) == false) {
            if (val != "") item = ", " + item;
            $("#table_schema").val(val + item);
          }
        }
      }

    </script>

    <script>
      (function (H) { H.className = H.className.replace(/\bno-js\b/, 'js') })(document.documentElement);

      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("fouc").style.display = "block";
        // 이곳에 다른 초기화 코드 추가
      });
    </script>

    <style>
      #loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        /* 반투명 배경 */
        display: flex;
        justify-content: center;
        /* 가로 중앙 정렬 */
        align-items: center;
        /* 세로 중앙 정렬 */
        z-index: 1000;
        /* 최상위 레이어 */
      }

      #infering {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        /* 반투명 배경 */
        display: flex;
        justify-content: center;
        /* 가로 중앙 정렬 */
        align-items: center;
        /* 세로 중앙 정렬 */
        z-index: 1000;
        /* 최상위 레이어 */
      }

      #loading-content {
        padding: 20px;
        background-color: #fff;
        /* 배경색 */
        border-radius: 10px;
        /* 모서리 둥글게 */
        text-align: center;
        /* 텍스트 중앙 정렬 */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        /* 그림자 효과 */
      }

      .loading-spinner {
        border: 4px solid #f3f3f3;
        /* 회색 */
        border-top: 4px solid #3498db;
        /* 파란색 */
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin: 0 auto;
        /* 가로 중앙 정렬 */
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    </style>



    <style>
      .a,
      .ul,
      .li {
        text-decoration: none;
      }

      .no-caret {
        list-style-type: none;
      }

      .custom-input-group {
        border: 1px solid #ced4da;
        /* Bootstrap 기본 보더 색상 */
        border-radius: .25rem;
        /* Bootstrap 기본 border-radius */
        display: flex;
        /* 한 줄에 나오게 하기 위해 flexbox 사용 */
      }

      .custom-input {
        border: 0;
        /* 입력 필드의 보더 제거 */
        box-shadow: none;
        /* 입력 필드의 그림자 제거 */
      }

      .custom-clear-button {
        background-color: transparent;
        /* 버튼 배경 투명 */
        border: 0;
        /* 버튼의 보더 제거 */
      }

      .custom-input-group .custom-input:focus {
        box-shadow: none;
        /* 입력 필드 포커스 시 그림자 제거 */
      }

      .container-flex {
        display: flex;
        flex-direction: row;
        width: 100%;
      }


      .sidebar-left,
      .sidebar-right,
      .center-content {
        flex: 1;
      }

      .sidebar-left {
        display: flex;
        flex-direction: column;
        height: 100%;
        /* 또는 부모 요소의 높이에 따라 조정 */
      }

      #datagrpDiv {
        height: 250px;
        margin-top: 10px;
        overflow-y: auto;
      }

      #columnInfoDiv {
        height: 250px;
        margin-top: 10px;
        margin-left: 10px;
        overflow-y: auto;
      }

      .divider {
        flex: 0.001;
        background-color: #f5f5f5;
      }

      .center-content {
        flex: 3;
      }

      .sidebar-right {
        flex: 1;
      }

      .box-body {
        padding: 20px;
      }
    </style>

    <style>
      .datagrp-name {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 5px;
        color: #111111;
        text-decoration: none;
      }

      .datagrp-name:hover {
        text-decoration: none;
      }

      .db-icon,
      .table-icon {
        margin-right: 5px;
      }

      .query_comment {
        font-size: 10pt;
        color: #777;
      }
    </style>

    <style>
      #loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        /* 반투명 배경 */
        display: flex;
        justify-content: center;
        /* 가로 중앙 정렬 */
        align-items: center;
        /* 세로 중앙 정렬 */
        z-index: 1000;
        /* 최상위 레이어 */
      }

      #infering {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        /* 반투명 배경 */
        display: flex;
        justify-content: center;
        /* 가로 중앙 정렬 */
        align-items: center;
        /* 세로 중앙 정렬 */
        z-index: 1000;
        /* 최상위 레이어 */
      }

      #loading-content {
        padding: 20px;
        background-color: #fff;
        /* 배경색 */
        border-radius: 10px;
        /* 모서리 둥글게 */
        text-align: center;
        /* 텍스트 중앙 정렬 */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        /* 그림자 효과 */
      }

      .loading-spinner {
        border: 4px solid #f3f3f3;
        /* 회색 */
        border-top: 4px solid #3498db;
        /* 파란색 */
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin: 0 auto;
        /* 가로 중앙 정렬 */
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    </style>

    <% if(message.length){ %>
      <script>toastr.success("<%=message%>")</script>
      <% } %>
        <% if(err.length){ %>
          <script>toastr.success("<%=err%>")</script>
          <% } %>

            <div id="infering" style="display: none;">
              <div id="loading-content">
                <div class="loading-spinner"></div>
                Code 작성중...
              </div>
            </div>

            <div id="loading" style="display: none;">
              <div id="loading-content">
                <div class="loading-spinner"></div>
                로딩 중...
              </div>
            </div>

            <script>
              $('#sampledataModal').on('shown.bs.modal', function () {
                $('#myInput').trigger('focus')
              })


            </script>
            <style>
              #sampledataModal {
                top: 200px;
              }

              ul {
                list-style-type: none;
                padding-left: 20px;
              }

              li {
                position: relative;
                cursor: pointer;
              }
            </style>

            <div id="infering" style="display: none;">
              <div id="loading-content">
                <div class="loading-spinner"></div>
                Query 작성중...
              </div>
            </div>

            <div id="sampledataModal" class="modal fade" tabindex="-1" role="dialog">
              <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">샘플 </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body text-left">
                    <ul id="listContainer">
                      <li>1. Bootstrap css를 사용하는 로그인 Web 화면 작성하기: 항목(mb_email, mb_password)</li>
                      <li>2. 년월을 주었을때 해당 월의 날자수를 계산하기: 언어-javascript</li>
                      <li>3. Springboot API Controller - 로그인 체크: 항목(mb_email, mb_password)</li>
                      <li>4. Springboot API Controller(데이터스키마를 지정하세오)</li>
                      <li>5. 회원조회api(getMember)를 fetch해서 form에 채워넣는 함수 만들기: 언어-javascript, 항목-회원id,성명,이메일,핸드폰</li>
                      <li>6. 회원정보 입력 폼: 언어-html/jquery, 항목-회원id,성명,이메일,핸드폰</li>
                      <li>7. 회원정보 입력 폼: 언어-VueJS/javascript, 항목-회원id,성명,이메일,핸드폰</li>
                      <li>8. 회원정보 등록 api: 언어-nodejs, 항목-mb_id(회원id),mb_name(성명),mb_email(이메일),mb_hp(핸드폰)</li>
                      <li>9. 메뉴Tree 를 조회하기, start with/connect by를 사용하는 Oracle SQL, menu table ( menu_id, menu_name,
                        menu_type(1=폴더/2=메뉴), up_menu_id=상위폴더 )</li>
                    </ul>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="content-wrapper">

              <!-- Content Header (Page header) -->
              <section class="content-header">
                <h1>Playground

                  <small>AiCode</small>
                </h1>
                <ol class="breadcrumb">
                  <li>
                    <a href="#"><i class="fa fa-dashboard"></i> Home > Playground</a>
                  </li>
                  <li class="active"></li>
                </ol>
              </section>

              <section class="content">
                <div class="row">
                  <div class="box box-info">
                    <div class="container-flex" style="background-color: #fff;">
                      <div class="center-content">

                        <div class="row" style="margin-right:15px; margin-top:10px;">
                          <!-- <button type="button" title="안내" onclick="guide()" class="pull-right btn transparent-button"
                          id="helpBtn">
                          <i class="fa fa-question-circle"></i>
                        </button> -->
                          <button type="button" title="Clear" onclick="clearRequest()"
                            class="pull-right btn transparent-button" style="margin-right:5px;" id="clearRequestBtn">
                            <i class="fa fa-eraser"></i></button>
                          <button type="button" title="샘플" onclick="setSampleData(1)"
                            class="pull-right btn transparent-button" style="margin-right:5px;" id="setSampleDataBtn">
                            Sample</button>

                        </div>

                        <div class="box-body">
                          <form method="post" id="workForm" name="workForm">
                            <input type="hidden" name="pjt_id" id="pjt_id" value="<%= info.pjt_id %>" />
                            <input type="hidden" readonly class="form-control" id="ac_id" name="ac_id"
                              value="<%= info.ac_id %>" />
                            <input type="hidden" class="form-control" id="ac_name" name="ac_name" value="" />
                            <div class="form-group">
                              <label>요구사항</label>
                              <textarea class="form-control" id="request" name="request" rows=4 /></textarea>
                            </div>
                            <div class="form-group" style="display:none">
                              <label>Target</label>
                              <select class="form-control" id="target" name="target">
                              </select>
                              <label id="languageLabel">언어</label>
                              <select class="form-control" id="language" name="language">
                              </select>
                            </div>
                            <div id="frameworkDiv" style="display:none;">
                              <div class="form-group">
                                <label>프레임웍</label>
                                <select class="form-control" id="framework" name="framework">
                                </select>

                                <label>컴포넌트</label>
                                <select class="form-control" id="module_type" name="module_type">
                                </select>
                              </div>
                            </div>
                            <input type="hidden" class="form-control" id="datagrp_id" name="datagrp_id">
                            <!-- <div class="form-group">
                              <label>데이터그룹ID</label>
                              <select class="form-control" id="datagrp_id" name="datagrp_id">
                              </select>
                            </div> -->
                            <div class="form-group">
                              <label>데이터스키마</label>
                              <textarea class="form-control" id="table_schema" name="table_schema" rows=4 /></textarea>
                            </div>
                            <div class="form-group">
                              <button type="button" onclick="requestGenerate()" class="pull-right btn btn-default"
                                id="send" style="margin-right: 5px;">
                                <i class="fa fa-paper-plane"></i> Submit
                              </button>
                              <button type="button" class="pull-right btn btn-default" onclick="update()">
                                <i class="fa fa-save"></i> 저장
                              </button>

                            </div>

                            <div class="form-group">
                              <label>생성된코드</label>
                              <textarea class="form-control" id="content" name="content" rows=12 /></textarea>
                            </div>
                            <input type="hidden" class="form-control" id="file_name" name="file_name"
                              value="<%= info.file_name %>" />
                            <input type="hidden" class="form-control" id="pjt_code" name="pjt_code"
                              value="<%= info.pjt_code %>" />
                            <input type="hidden" class="form-control" id="org_id" name="org_id"
                              value="<%= info.org_id %>" />
                            <input type="hidden" class="form-control" id="reg_mb_id" name="reg_mb_id"
                              value="<%= info.reg_mb_id %>" />
                            <input type="hidden" class="form-control" id="reg_dt" name="reg_dt"
                              value="<%= info.reg_dt %>" />

                            <!-- Buttons -->
                            <div class="form-group">
                              <div class="form-inline text-center">

                                <button type="button" onclick="clearRequest()" class="pull-right btn btn-default"
                                  id="clear">
                                  <i class="fa fa-eraser"></i> Clear
                                </button>

                                <button type="button" onclick="copyContent()" class="pull-right btn btn-default"
                                  style="margin-right: 5px;" id="copy">
                                  <i class="fa fa-copy"></i> Copy Code
                                </button>
                                <button type="button" onclick="downloadContent()" class="pull-right btn btn-default"
                                  style="margin-right: 5px;" id="download">
                                  <i class="fa fa-file-excel-o"></i> Download Code
                                </button>

                                <!-- <button type="button" class="pull-right btn btn-default" style="margin-right: 5px"
                                  onclick="list()">
                                  <i class="fa fa-list"></i> 목록
                                </button> -->
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>

                      <div class="divider"></div>
                      <div class="sidebar-right">

                        <div style="font-weight:bold; font-size:12pt;  padding:5px; margin-top:3px; margin-left:3px; "
                          id="metarelationlist-title">테이블정보
                        </div>
                        <div style="margin-top:5px; height:1px; background-color:#f5f5f5; "></div>
                        <div id="tableInfoDiv" style="height:350px; overflow-y: auto;">
                          <ul>
                            <% let currentDbName='' ; %>
                              <% datamodelList.forEach(function(model, index) { %>
                                <% if (model.db_name !==currentDbName) { %>
                                  <% if (currentDbName !=='' ) { %>
                          </ul>
                          <% } %>
                            <li>
                              <a href="javascript:void(0);" class="db-name" data-toggle="collapse"
                                data-target="#db_<%= index %>">
                                <i class="fa fa-database db-icon"></i>
                                <%= model.db_name %>
                              </a>
                              <div id="db_<%= index %>" class="collapse">
                                <ul>
                                  <% } %>
                                    <li class="table-name" data-id="<%= model.id %>" data-name="<%= model.table_name %>"
                                      data-dbname="<%= model.db_name %>" style="cursor: pointer;">
                                      <i class="fa fa-table table-icon"></i>
                                      <a href="javascript:getColumnInfo('<%= model.id %>')">
                                        <%= model.table_name %>(<%= model.table_id %>)
                                      </a>
                                    </li>

                                    <% currentDbName=model.db_name; %>
                                      <% }); %>
                                        <% if (datamodelList.length> 0) { %>
                                </ul>
                              </div>
                              <% } %>
                            </li>
                            </ul>
                        </div>

                        <div style="margin-top:5px; height:1px; background-color:#f5f5f5; "></div>
                        <div id="columnTableNameDiv" name="columnTableNameDiv" style="margin-top:5px; "></div>
                        <div id="columnInfoDiv" name="columnInfoDiv" style="margin-left: 10px;">

                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </section>

            </div>

            <!-- /.content -->

            <%-include user.tail.ejs %>

              %>


< sample view program >

<%-include ./user.head.ejs %>

<script type="text/javascript">
  function update() {
    
    $('input[type!="hidden"][required], textarea[required]').each(function () {
        if (!$(this).val()) {
          $(this).focus();
          alert(`${$(this).attr("name")}은(는) 필수 입력 항목입니다.`);
          return false;
        }
      });
    
    event.preventDefault();
    const formData = new URLSearchParams(new FormData(document.workForm));
    fetch("/updateAicode", {
        method: "PATCH",
        mode: "same-origin",
        credentials: "same-origin",
        body: formData,
      })
    .then((res) => res.json())
    .then((response) => {
        if (response.status == 200) {
          toastr.success("수정하였습니다");
        } else {
          toastr.warning(response.message);
        }
      })
    .catch((error) => {
        toastr.error("에러가 발생 하였습니다.");
      });
  }
  
  function deleteCurrent(pid) {
    if (confirm("정말 삭제하시겠습니까?")) {
      event.preventDefault();
      fetch(`/deleteAicode/${pid}`, {
          method: "DELETE",
          mode: "same-origin",
          credentials: "same-origin",
        })
      .then((res) => res.json())
      .then((response) => {
          if (response.status == 200) {
            alert("삭제하였습니다");
            location.href = "/getAicodes";
          } else {
            toastr.error(response.message);
          }
        })
      .catch((error) => {
          toastr.error("에러가 발생 하였습니다.");
        });
    }
  }
  
  function list() {
    var form = document.workForm;
    form.method = "GET";
    form.action = "/getAicodes";
    form.submit();
  }
</script>

<div class="content-wrapper">
  <section class="content-header">
    <h1>
    
    <small></small>
    </h1>
    <ol class="breadcrumb">
    <li>
    <a href="#"><i class="fa fa-dashboard"></i>  Home > </a>
    </li>
    <li class="active"></li>
    </ol>
  </section>
  
  <section class="content">
    <div class="row">
      <div class="box box-info" style="padding: 20px">
        <div class="box-body">
          <form ac_id="AicodeForm" name="workForm" method="post">
          <input type="hidden" name="iPage" ac_id="iPage" value="<%= rPage %>" />
          
          <div class="form-group">
            <label>코드 ID</label>
            <input type="text" readonly class="form-control" id="ac_id" name="ac_id" value="<%= info.ac_id %>" />
          </div>
          <div class="form-group">
            <label>명칭</label>
            <input type="text"  class="form-control" id="ac_name" name="ac_name" value="<%= info.ac_name %>" />
          </div>
          <div class="form-group">
            <label>요구사항</label>
            <input type="text"  class="form-control" id="request" name="request" value="<%= info.request %>" />
          </div>
          <div class="form-group">
            <label>Target</label>
            <input type="text"  class="form-control" id="ac_target" name="ac_target" value="<%= info.ac_target %>" />
          </div>
          <div class="form-group">
            <label>언어</label>
            <input type="text"  class="form-control" id="ac_lang" name="ac_lang" value="<%= info.ac_lang %>" />
          </div>
          <div class="form-group">
            <label>프레임웍</label>
            <input type="text"  class="form-control" id="ac_framework" name="ac_framework" value="<%= info.ac_framework %>" />
          </div>
          <div class="form-group">
            <label>모듈타입</label>
            <input type="text"  class="form-control" id="ac_module_type" name="ac_module_type" value="<%= info.ac_module_type %>" />
          </div>
          <div class="form-group">
            <label>데이터그룹ID</label>
            <input type="text"  class="form-control" id="data_grp_id" name="data_grp_id" value="<%= info.data_grp_id %>" />
          </div>
          <div class="form-group">
            <label>데이터스키마</label>
            <input type="text"  class="form-control" id="table_schema" name="table_schema" value="<%= info.table_schema %>" />
          </div>
          <div class="form-group">
            <label>생성된코드</label>
            <input type="text"  class="form-control" id="content" name="content" value="<%= info.content %>" />
          </div>
          <div class="form-group">
            <label>파일명</label>
            <input type="text"  class="form-control" id="file_name" name="file_name" value="<%= info.file_name %>" />
          </div>
          <div class="form-group">
            <label>프로젝트코드</label>
            <input type="text"  class="form-control" id="pjt_code" name="pjt_code" value="<%= info.pjt_code %>" />
          </div>
          <div class="form-group">
            <label>학교ID</label>
            <input type="text"  class="form-control" id="org_id" name="org_id" value="<%= info.org_id %>" />
          </div>
          <div class="form-group">
            <label>등록자</label>
            <input type="text"  class="form-control" id="reg_mb_id" name="reg_mb_id" value="<%= info.reg_mb_id %>" />
          </div>
          <div class="form-group">
            <label>등록일시</label>
            <input type="text"  class="form-control" id="reg_dt" name="reg_dt" value="<%= info.reg_dt %>" />
          </div>
          
          <div class="form-group">
            <div class="form-inline text-center">
              <button
              type="button"
              class="pull-right btn btn-default"
              style="margin-right: 10px"
              onclick="update()"
              >
              <i class="fa fa-save"></i> 저장
              </button>
              <button
              type="button"
              class="pull-right btn btn-default"
              style="margin-right: 5px"
              onclick="deleteCurrent('<%=info.ac_id%>')"
              >
              <i class="fa fa-trash"></i> 삭제
              </button>
              <button
              type="button"
              class="pull-right btn btn-default"
              style="margin-right: 5px"
              onclick="list()"
              >
              <i class="fa fa-list"></i> 목록
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</div>

<%-include ./user.tail.ejs %>


CREATE TABLE `km_job_log` (
	`log_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '로그ID',
	`req_id` INT(8) NOT NULL COMMENT '요청ID',
	`board_name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`status` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '상태코드' COLLATE 'utf8_general_ci',
  `result` VARCHAR(200) NOT NULL DEFAULT '' COMMENT '결과' COLLATE 'utf8_general_ci',
	`post_cnt` INT(8) NOT NULL COMMENT '게시물건수',
	`new_cnt` INT(8) NOT NULL COMMENT '신규건수',
	`reg_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '등록일시',
	PRIMARY KEY (`log_id`) USING BTREE	
)
COMMENT='작업로그'
COLLATE='utf8_general_ci'
ENGINE=MyISAM
AUTO_INCREMENT=6
;
finder.js 반영
1. fetchBoard 실행후 km_job_log에 등록하기
  log_id <= auto
  req_id <= config.req_id
  board_name <= config.board_name
  status <= fetchBoard result status
  result <= fetchBoard result message
  post_cnt <= result post count
  new_cnt <= result new count

2. checkBoards 실행시 config.check_interval 체크

   config.id = km_job_log.req_id 인건의 reg_datetime 과 현재시간을 비교하여 
   config.check_interval 이 경과하지 않았으면 checkBoard를 실행하지 않음.
   

finder.js 에 km_finder_run 반영 
  checkBoard()실행후 

  run_id <= auto, run_date <= 오늘날짜, run_cnt ++, run_datetime <= auto set
  하루에 row가 한개씩 생기며 checkBoard실행시 run_cnt를 1씩 증가함.

  