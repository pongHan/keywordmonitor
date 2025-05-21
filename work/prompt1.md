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


CREATE TABLE `km_request` (
	`req_id` INT(8) NOT NULL COMMENT '요청ID' AUTO_INCREMENT,
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`receiver_email` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '수신이메일' COLLATE 'utf8_general_ci',
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
