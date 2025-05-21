
CREATE TABLE `km_detect` (
	`detect_id` INT(8) NOT NULL COMMENT 'ID' AUTO_INCREMENT,
	`req_id` INT(8) NOT  NULL DEFAULT 0 COMMENT '요청ID',
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`board_name` VARCHAR(50) NOT NULL DEFAULT ''  COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`post_url` VARCHAR(500) NOT NULL DEFAULT ''  COMMENT 'URL' COLLATE 'utf8_general_ci',
	`keyword` VARCHAR(100) NOT NULL DEFAULT ''  COMMENT '키워드' COLLATE 'utf8_general_ci',
	`detect_datetime` TIMESTAMP NOT NULL  COMMENT '감지일시',
	`detect_title` VARCHAR(255) NOT NULL  COMMENT '글제목' DEFAULT '' COLLATE 'utf8_general_ci',
	`detect_content` TEXT NOT NULL   COMMENT '글내용' COLLATE 'utf8_general_ci',
	`detect_status` VARCHAR(20) NOT NULL  COMMENT '상태' DEFAULT 'open' COLLATE 'utf8_general_ci',
	`after_proc` VARCHAR(255) NOT NULL  COMMENT '사후조치' DEFAULT '' COLLATE 'utf8_general_ci',
	`proc_datetime` DATETIME NOT NULL  COMMENT '조치일시' DEFAULT '0000-00-00 00:00:00',
	PRIMARY KEY (`detect_id`) USING BTREE,
	INDEX `index1` (`req_id`) USING BTREE
)
COLLATE='utf8_general_ci'
ENGINE=MYISAM;


DROP  TABLE `km_request`;

CREATE TABLE `km_request` (
	`req_id` INT(8) NOT NULL COMMENT '요청ID' AUTO_INCREMENT,
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`receive_email` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '수신이메일' COLLATE 'utf8_general_ci',
	`board_name` VARCHAR(100) NOT NULL DEFAULT ''  COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`board_type` VARCHAR(50) NOT NULL DEFAULT ''  COMMENT '게시판Type' COLLATE 'utf8_general_ci',
	`post_url` VARCHAR(500) NOT NULL DEFAULT ''  COMMENT 'URL' COLLATE 'utf8_general_ci',
	`keyword` VARCHAR(100) NOT NULL DEFAULT ''  COMMENT '키워드' COLLATE 'utf8_general_ci',
	`parsing_config` VARCHAR(500) NOT NULL DEFAULT ''  COMMENT '파서설정' COLLATE 'utf8_general_ci',
	`parsing_type` VARCHAR(20) NOT NULL DEFAULT ''  COMMENT '파싱타입' COLLATE 'utf8_general_ci',
	`req_status` VARCHAR(20) NOT NULL  COMMENT '상태' DEFAULT 'open' COLLATE 'utf8_general_ci',
	`start_date` VARCHAR(12) NOT NULL  COMMENT '시작일자'  COLLATE 'utf8_general_ci',
	`end_date` VARCHAR(12) NOT NULL  COMMENT '종료일자'  COLLATE 'utf8_general_ci',
	`pay_type` VARCHAR(20) NOT NULL  COMMENT 'Pay타입'  COLLATE 'utf8_general_ci',
	`pay_amount` INT(8) NOT NULL  COMMENT '금액',
	`reg_datetime` TIMESTAMP NOT NULL  COMMENT '등록일시',
	PRIMARY KEY (`req_id`) USING BTREE,
	INDEX `index1` (`req_mb_id`) USING BTREE
)
COLLATE='utf8_general_ci'
ENGINE=MYISAM
AUTO_INCREMENT=1
;



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

