UPDATE tb_user SET email_verified = 'Y' WHERE mb_id = 'manager1';


CREATE TABLE `tb_org` (
	`org_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '기관ID',
	`org_name` VARCHAR(100) NOT NULL COMMENT '기관명' COLLATE 'utf8_general_ci',
	`org_type` VARCHAR(50) NULL DEFAULT NULL COMMENT '타입' COLLATE 'utf8_general_ci',
	`sido` VARCHAR(50) NULL DEFAULT NULL COMMENT '시도' COLLATE 'utf8_general_ci',
	`gugun` VARCHAR(50) NULL DEFAULT NULL COMMENT '구군' COLLATE 'utf8_general_ci',
	`myundong` VARCHAR(50) NULL DEFAULT NULL COMMENT '면동' COLLATE 'utf8_general_ci',
	`use_yn` VARCHAR(10) NOT NULL DEFAULT 'Y' COMMENT '사용여부' COLLATE 'utf8_general_ci',
	`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
	PRIMARY KEY (`org_id`) USING BTREE
)
COMMENT='기관'
COLLATE='utf8_general_ci'
ENGINE=MyISAM
AUTO_INCREMENT=10
;
