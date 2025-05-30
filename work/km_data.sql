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


TRUNCATE km_detect;

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


CREATE TABLE `km_detect` (
	`detect_id` INT(8) NOT NULL AUTO_INCREMENT COMMENT 'ID',
	`req_id` INT(8) NOT NULL DEFAULT '0' COMMENT '요청ID',
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`board_name` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`keyword` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '키워드' COLLATE 'utf8_general_ci',
	`post_url` VARCHAR(500) NOT NULL DEFAULT '' COMMENT 'URL' COLLATE 'utf8_general_ci',
	`post_title` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '글제목' COLLATE 'utf8_general_ci',
	`post_content` TEXT NOT NULL COMMENT '글내용' COLLATE 'utf8_general_ci',
	`post_date` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '게시일자' COLLATE 'utf8_general_ci',
	`detect_status` VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '상태' COLLATE 'utf8_general_ci',
	`detect_datetime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '감지일시',
	`after_proc` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '사후조치' COLLATE 'utf8_general_ci',
	`proc_datetime` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '조치일시',
	PRIMARY KEY (`detect_id`) USING BTREE,
	INDEX `index1` (`req_id`) USING BTREE,
	INDEX `datetime` (`detect_datetime`) USING BTREE
)
COMMENT='키워드 감지'
COLLATE='utf8_general_ci'
ENGINE=MyISAM
AUTO_INCREMENT=89
;



INSERT INTO km_request (
  req_mb_id, receiver_email, board_name, board_type, post_url,
  keyword, parsing_config, parsing_type, req_status,
  start_date, end_date, pay_type, pay_amount, reg_datetime
)km_request
VALUES
-- id: 1
(
  'modeller@naver.com', 'modeller@naver.com', '알파룸', 'notice',
  'http://alpha1room.cafe24.com/bbs/board.php?bo_table=notice',
  '테스트', 
  '{"container":{"tag":"div","id":"view_2"},"title":{"tag":"font","size":"3"},"date":{"tag":"font","color":"#00BFFF"},"link":"date_based","parsing_type":"text"}',
  'text', 'close',
  '2025-01-01', '2025-12-30', 'free', 0, NOW()
),
-- id: 2
(
  'modeller@naver.com', 'modeller@naver.com', '알파룸', 'inquiry',
  'http://alpha1room.cafe24.com/bbs/board.php?bo_table=inquiry',
  '이벤트',
  '{"container":{"tag":"div","style":"border:1px solid #ddd"},"title":{"tag":"div","style":"color:#505050"},"link":{"tag":"a","onclick":"trackback_send_server"},"parsing_type":"text"}',
  'text', 'close',
  '2025-01-01', '2025-12-30', 'free', 0, NOW()
),
-- id: 3
(
  'modeller@naver.com', 'modeller@naver.com', 'PGR21 Humor', 'pgr21_humor',
  'https://www.pgr21.com/humor/0',
  '백종원',
  '{"container":{"tag":"tr","class":"listtr"},"title":{"tag":"td","class":"tdsub","search_all":false},"date":{"tag":"td","class":"tddate","index":4},"link":{"tag":"a","href":true},"parsing_type":"text"}',
  'text', 'open',
  '2025-01-01', '2025-12-30', 'free', 0, NOW()
),
-- id: 4
(
  'modeller@naver.com', 'modeller@naver.com', '펨코', 'fmkorea',
  'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1',
  '손흥민',
  '{"container":{"tag":"li","class":"li"},"title":{"tag":"h3","class":"title"},"date":{"tag":"span","class":"regdate"},"link":{"tag":"a","href":true},"parsing_type":"text"}',
  'text', 'open',
  '2025-01-01', '2025-12-30', 'free', 0, NOW()
),
-- id: 5
(
  'modeller@naver.com', 'modeller@naver.com', '희망리턴패키지', 'sbiz24_notice',
  'https://www.sbiz24.kr/#/cmmn/gnrl/bbs/4?aditFieldNm1=13&pstTtl&mySearch=N&isSearch=Y',
  '희망리턴',
  '{"container":{"tag":"tr"},"title":{"tag":"td","search_all":true},"date":{"tag":"td","index":3},"link":"date_based","parsing_type":"ocr"}',
  'ocr', 'close',
  '2025-01-01', '2025-12-30', 'free', 0, NOW()
);




  {
    "id" : 5,
    "receiver_name": "수신자",
    "receiver_email": "modeller@naver.com",
    "url": "https://www.sbiz24.kr/#/cmmn/gnrl/bbs/4?aditFieldNm1=13&pstTtl&mySearch=N&isSearch=Y",
    "keyword": "희망리턴",
    "board_type": "sbiz24_notice",
    "board_name": "희망리턴패키지",
    "status" : "close",
    "start_date" : "2025-01-01",
    "end_date" : "2025-12-30",
    "parsing_config": {
      "container": { "tag": "tr" },
      "title": { "tag": "td", "search_all": true },
      "date": { "tag": "td", "index": 3 },
      "link": "date_based",
      "parsing_type": "ocr"
    }
  }

