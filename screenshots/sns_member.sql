
CREATE TABLE `km_detect_data` (
	`detect_id` INT(8) NOT NULL COMMENT 'ID' AUTO_INCREMENT,
	`req_id` INT(8) NOT  NULL DEFAULT 0 COMMENT '요청ID',
	`req_mb_id` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '회원ID' COLLATE 'utf8_general_ci',
	`board_name` VARCHAR(50) NOT NULL DEFAULT ''  COMMENT '게시판명' COLLATE 'utf8_general_ci',
	`board_url` VARCHAR(500) NOT NULL DEFAULT ''  COMMENT 'URL' COLLATE 'utf8_general_ci',
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
ENGINE=MyISAM
AUTO_INCREMENT=1
;
