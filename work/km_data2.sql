-- --------------------------------------------------------
-- 호스트:                          220.73.161.110
-- 서버 버전:                        5.1.45-log - Source distribution
-- 서버 OS:                        unknown-linux-gnu
-- HeidiSQL 버전:                  12.5.0.6677
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 테이블 indiarecruit.km_detect 구조 내보내기
CREATE TABLE IF NOT EXISTS `km_detect` (
  `detect_id` int(8) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `req_id` int(8) NOT NULL DEFAULT '0' COMMENT '요청ID',
  `req_mb_id` varchar(50) NOT NULL DEFAULT '' COMMENT '회원ID',
  `board_name` varchar(50) NOT NULL DEFAULT '' COMMENT '게시판명',
  `keyword` varchar(100) NOT NULL DEFAULT '' COMMENT '키워드',
  `post_url` varchar(500) NOT NULL DEFAULT '' COMMENT 'URL',
  `post_title` varchar(255) NOT NULL DEFAULT '' COMMENT '글제목',
  `post_content` text NOT NULL COMMENT '글내용',
  `post_date` varchar(20) NOT NULL DEFAULT '' COMMENT '게시일자',
  `detect_status` varchar(20) NOT NULL DEFAULT 'open' COMMENT '상태',
  `detect_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '감지일시',
  `after_proc` varchar(255) NOT NULL DEFAULT '' COMMENT '사후조치',
  `proc_datetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '조치일시',
  PRIMARY KEY (`detect_id`) USING BTREE,
  KEY `index1` (`req_id`),
  KEY `datetime` (`detect_datetime`)
) ENGINE=MyISAM AUTO_INCREMENT=88 DEFAULT CHARSET=utf8 COMMENT='키워드 감지';

-- 테이블 데이터 indiarecruit.km_detect:87 rows 내보내기
/*!40000 ALTER TABLE `km_detect` DISABLE KEYS */;
INSERT INTO `km_detect` (`detect_id`, `req_id`, `req_mb_id`, `board_name`, `keyword`, `post_url`, `post_title`, `post_content`, `post_date`, `detect_status`, `detect_datetime`, `after_proc`, `proc_datetime`) VALUES
	(1, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '유로파 결승 준비중인 손흥민 근황.mp4 [438]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(2, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '송소희 "손흥민과 결혼 얘기 안 했으면 좋겠다. 하지마라." [306]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(3, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[공홈] 손흥민 UEFA 유로파리그 결승 기자회견 [989]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(4, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[TB] 손흥민 : 한국인으로 태어난 것을 매우 감사하게 생각하며, 항상... [406]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(5, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '다시보는 손흥민 커리어 역사상 3번의 결승전 [614]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(6, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[TNT] 토트넘팬들이 자신에게 보낸 메세지를 보는 손흥민 [342]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(7, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '빌바오에서 요렌테 만난 손흥민 ㅋㅋ [136]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(8, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '빌바오에서 다시 재회한 손흥민과 요렌테 [179]', '', '', '1', '2025-05-21 13:53:14', '', '0000-00-00 00:00:00'),
	(9, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 포스텍 : 손흥민처럼 아시아 선수 중 이렇게 길게 최고의 ... [369]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(10, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 손흥민 : 새벽까지 봐주시는 한국 팬분들에게 제 미소와, 트... [431]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(11, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민 만나며 다른 사업가와 양다리 교제…협박녀 "누구 애인지 모른다" [457]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(12, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[텔레그래프] 토트넘은 손흥민 없이 더 높은 승률을 보이지만, 결승전... [304]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(13, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[단독] "임신, 두 남자에게 연락했다"…손흥민, 공갈 사건의 반전 [1241]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(14, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[디스패치] 손흥민, 협박 사건의 반전 [2863]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(15, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '\'손흥민 협박녀\' 엉뚱한 여자 신상 털림 ㄷㄷㄷ [205]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(16, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민 수행비서 돈 건네준 사실 정정됨 [653]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(17, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[단독] \'손흥민 협박\' 남성 과거 동종 전과… "입막음 대가 6500만원... [394]', '', '', '1', '2025-05-21 13:53:15', '', '0000-00-00 00:00:00'),
	(18, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '유로파 결승 준비중인 손흥민 근황.mp4 [442]', '', '', '1', '2025-05-21 13:54:13', '', '0000-00-00 00:00:00'),
	(19, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '유로파 결승 준비중인 손흥민 근황.mp4 [448]', '', '', '1', '2025-05-21 13:57:25', '', '0000-00-00 00:00:00'),
	(20, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[공홈] 손흥민 UEFA 유로파리그 결승 기자회견 [990]', '', '', '1', '2025-05-21 13:57:26', '', '0000-00-00 00:00:00'),
	(21, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[스포츠] 손흥민에게 "팀은 지금 괜찮나" 물어본 영국 국왕.jpg', '', '', '1', '2025-05-21 13:59:40', '', '0000-00-00 00:00:00'),
	(22, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[스포츠] 손흥민이 그리워한 영국음식.jpg', '', '', '1', '2025-05-21 13:59:40', '', '0000-00-00 00:00:00'),
	(23, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[LOL] 손흥민 그님티 ???', '', '', '1', '2025-05-21 13:59:40', '', '0000-00-00 00:00:00'),
	(24, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[기타] T1 선수단, 손흥민과 만나서 토트넘 경기 직관 예정', '', '', '1', '2025-05-21 13:59:40', '', '0000-00-00 00:00:00'),
	(25, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[스포츠] 손흥민에게 "팀은 지금 괜찮나" 물어본 영국 국왕.jpg', '', '', '1', '2025-05-21 15:31:56', '', '0000-00-00 00:00:00'),
	(26, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[스포츠] 손흥민이 그리워한 영국음식.jpg', '', '', '1', '2025-05-21 15:31:56', '', '0000-00-00 00:00:00'),
	(27, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[LOL] 손흥민 그님티 ???', '', '', '1', '2025-05-21 15:31:56', '', '0000-00-00 00:00:00'),
	(28, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[기타] T1 선수단, 손흥민과 만나서 토트넘 경기 직관 예정', '', '', '1', '2025-05-21 15:31:56', '', '0000-00-00 00:00:00'),
	(29, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[스포츠] 손흥민에게 "팀은 지금 괜찮나" 물어본 영국 국왕.jpg', '', '', '1', '2025-05-21 15:52:43', '', '0000-00-00 00:00:00'),
	(30, 3, 'modeller@naver.com', 'PGR21 Humor', '손흥민', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[스포츠] 손흥민에게 "팀은 지금 괜찮나" 물어본 영국 국왕.jpg', '', '', '1', '2025-05-21 16:02:53', '', '0000-00-00 00:00:00'),
	(31, 3, 'modeller@naver.com', 'PGR21 Humor', '백종원', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[기타] 백종원 장터광장 상표권 특허신청... 분노한 예산시장 상인들', '', '', '1', '2025-05-21 16:03:55', '', '0000-00-00 00:00:00'),
	(32, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 트위터에서 한국 김때문에 일어난 싸움', '', '', '1', '2025-05-21 16:03:55', '', '0000-00-00 00:00:00'),
	(33, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 쌀값 근황.jpg (feat. 편의점)', '', '', '1', '2025-05-21 16:03:55', '', '0000-00-00 00:00:00'),
	(34, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 최대 웹소설 사이트 장르 랭킹1위 근황', '', '', '1', '2025-05-21 16:03:55', '', '0000-00-00 00:00:00'),
	(35, 3, 'modeller@naver.com', 'PGR21 Humor', '백종원', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[기타] 백종원 장터광장 상표권 특허신청... 분노한 예산시장 상인들', '', '', '1', '2025-05-21 16:14:28', '', '0000-00-00 00:00:00'),
	(36, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 트위터에서 한국 김때문에 일어난 싸움', '', '', '1', '2025-05-21 16:14:28', '', '0000-00-00 00:00:00'),
	(37, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 쌀값 근황.jpg (feat. 편의점)', '', '', '1', '2025-05-21 16:14:28', '', '0000-00-00 00:00:00'),
	(38, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 최대 웹소설 사이트 장르 랭킹1위 근황', '', '', '1', '2025-05-21 16:14:28', '', '0000-00-00 00:00:00'),
	(39, 3, 'modeller@naver.com', 'PGR21 Humor', '백종원', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[기타] 백종원 장터광장 상표권 특허신청... 분노한 예산시장 상인들', '', '', '1', '2025-05-21 16:25:14', '', '0000-00-00 00:00:00'),
	(40, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 트위터에서 한국 김때문에 일어난 싸움', '', '', '1', '2025-05-21 16:25:14', '', '0000-00-00 00:00:00'),
	(41, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 쌀값 근황.jpg (feat. 편의점)', '', '', '1', '2025-05-21 16:25:14', '', '0000-00-00 00:00:00'),
	(42, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 최대 웹소설 사이트 장르 랭킹1위 근황', '', '', '1', '2025-05-21 16:25:14', '', '0000-00-00 00:00:00'),
	(43, 3, 'modeller@naver.com', 'PGR21 Humor', '백종원', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[기타] 백종원 장터광장 상표권 특허신청... 분노한 예산시장 상인들', '', '', '1', '2025-05-21 22:20:27', '', '0000-00-00 00:00:00'),
	(44, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 민심 최악이라는 일본의 신임 농림수산상', '', '', '1', '2025-05-21 22:20:27', '', '0000-00-00 00:00:00'),
	(45, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 트위터에서 한국 김때문에 일어난 싸움', '', '', '1', '2025-05-21 22:20:27', '', '0000-00-00 00:00:00'),
	(46, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 쌀값 근황.jpg (feat. 편의점)', '', '', '1', '2025-05-21 22:20:27', '', '0000-00-00 00:00:00'),
	(47, 3, 'modeller@naver.com', 'PGR21 Humor', '일본', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '[유머] 일본 최대 웹소설 사이트 장르 랭킹1위 근황', '', '', '1', '2025-05-21 22:20:27', '', '0000-00-00 00:00:00'),
	(48, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '폭주중인 손흥민 인스타그램 [55]', '', '', '1', '2025-05-21 22:20:39', '', '0000-00-00 00:00:00'),
	(49, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '표효하는 손흥민 ㄷㄷ [84]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(50, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[속보] 손흥민 "우리 마지막 브라이튼전 취소하면 안됨?" ㅋㅋㅋㅋㅋㅋㅋ... [149]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(51, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '과거 인터뷰) 손흥민 "이 클럽을 위해 모든걸 바칠수 있다" [93]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(52, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민) 이제 편히 잘 수 있겠다. [144]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(53, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민 트로피 드는 순간 현지해설 버전 [93]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(54, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 인텨뷰 마치고 팬들에게 가는 손흥민 [75]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(55, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 손흥민:: 케인아, 우리가 해냈다. [74]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(56, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 손흥민:: 대한민국에서 응원하신 분들께 감사하다는 말을 전하... [190]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(57, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 한국팬들에게 감사인사 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ... [178]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(58, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[손흥민] 오늘만 제가 이 클럽의 레전드라고 말하고 싶습니다 [90]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(59, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 손흥민:: 이제 토전드 맞다고 인정할게요. 오늘까지만 ㅎ [184]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(60, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 인터뷰 입갤 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ... [337]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(61, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민 트로피 뒷모습 역대급 ㄷㄷㄷㄷㄷ [204]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(62, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 베일 투샷 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ [220]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(63, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[실시간]독일에서 생방으로 본 손흥민 독일어 인터뷰 입갤! [147]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(64, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '실시간) 독일 언론과 인터뷰한 손흥민ㅋㅋㅋㅋ [112]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(65, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '포스테코글루 : “나는 손흥민을 위해 이런 하루가 있기를 바랬다. 그 ... [371]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(66, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민 축하해주는 레버쿠젠 공식 트위터 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ [106]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(67, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 포스테코글루:: 오늘 같은 날이 손흥민의 날이 될 수 있길 ... [241]', '', '', '1', '2025-05-21 22:20:40', '', '0000-00-00 00:00:00'),
	(68, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', 'ㅈㄴ 감동인 손흥민 팬아트 [30]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(69, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 피지컬 뒤지네 ㄷㄷ [65]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(70, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '폭주중인 손흥민 인스타그램 [56]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(71, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '표효하는 손흥민 ㄷㄷ [87]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(72, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[속보] 손흥민 "우리 마지막 브라이튼전 취소하면 안됨?" ㅋㅋㅋㅋㅋㅋㅋ... [159]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(73, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '과거 인터뷰) 손흥민 "이 클럽을 위해 모든걸 바칠수 있다" [97]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(74, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민 트로피 드는 순간 현지해설 버전 [103]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(75, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 손흥민:: 대한민국에서 응원하신 분들께 감사하다는 말을 전하... [192]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(76, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 한국팬들에게 감사인사 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ... [179]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(77, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 손흥민:: 이제 토전드 맞다고 인정할게요. 오늘까지만 ㅎ [185]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(78, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 인터뷰 입갤 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ... [338]', '', '', '1', '2025-05-21 22:22:01', '', '0000-00-00 00:00:00'),
	(79, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 베일 투샷 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ [221]', '', '', '1', '2025-05-21 22:22:02', '', '0000-00-00 00:00:00'),
	(80, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[실시간]독일에서 생방으로 본 손흥민 독일어 인터뷰 입갤! [148]', '', '', '1', '2025-05-21 22:22:02', '', '0000-00-00 00:00:00'),
	(81, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', 'ㅈㄴ 감동인 손흥민 팬아트 [34]', '', '', '1', '2025-05-21 22:23:05', '', '0000-00-00 00:00:00'),
	(82, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[토트넘 우승] 손흥민 피지컬 뒤지네 ㄷㄷ [90]', '', '', '1', '2025-05-21 22:23:05', '', '0000-00-00 00:00:00'),
	(83, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '표효하는 손흥민 ㄷㄷ [88]', '', '', '1', '2025-05-21 22:23:05', '', '0000-00-00 00:00:00'),
	(84, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[속보] 손흥민 "우리 마지막 브라이튼전 취소하면 안됨?" ㅋㅋㅋㅋㅋㅋㅋ... [160]', '', '', '1', '2025-05-21 22:23:05', '', '0000-00-00 00:00:00'),
	(85, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민 트로피 드는 순간 현지해설 버전 [105]', '', '', '1', '2025-05-21 22:23:05', '', '0000-00-00 00:00:00'),
	(86, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '[인터뷰] 손흥민:: 대한민국에서 응원하신 분들께 감사하다는 말을 전하... [193]', '', '', '1', '2025-05-21 22:23:06', '', '0000-00-00 00:00:00'),
	(87, 4, 'modeller@naver.com', '펨코', '손흥민', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '포스테코글루 : “나는 손흥민을 위해 이런 하루가 있기를 바랬다. 그 ... [372]', '', '', '1', '2025-05-21 22:23:06', '', '0000-00-00 00:00:00');
/*!40000 ALTER TABLE `km_detect` ENABLE KEYS */;

-- 테이블 indiarecruit.km_request 구조 내보내기
CREATE TABLE IF NOT EXISTS `km_request` (
  `req_id` int(8) NOT NULL AUTO_INCREMENT COMMENT '요청ID',
  `req_mb_id` varchar(50) NOT NULL DEFAULT '' COMMENT '회원ID',
  `receiver_email` varchar(100) NOT NULL DEFAULT '' COMMENT '수신이메일',
  `req_status` varchar(20) NOT NULL DEFAULT 'open' COMMENT '상태',
  `board_name` varchar(100) NOT NULL DEFAULT '' COMMENT '게시판명',
  `board_type` varchar(50) NOT NULL DEFAULT '' COMMENT '게시판Type',
  `post_url` varchar(500) NOT NULL DEFAULT '' COMMENT 'URL',
  `keyword` varchar(100) NOT NULL DEFAULT '' COMMENT '키워드',
  `parsing_config` varchar(500) NOT NULL DEFAULT '' COMMENT '파서설정',
  `parsing_type` varchar(20) NOT NULL DEFAULT '' COMMENT '파싱타입',
  `start_date` varchar(12) NOT NULL COMMENT '시작일자',
  `end_date` varchar(12) NOT NULL COMMENT '종료일자',
  `pay_type` varchar(20) NOT NULL COMMENT 'Pay타입',
  `pay_amount` int(8) NOT NULL COMMENT '금액',
  `reg_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '등록일시',
  PRIMARY KEY (`req_id`) USING BTREE,
  KEY `index1` (`req_mb_id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- 테이블 데이터 indiarecruit.km_request:5 rows 내보내기
/*!40000 ALTER TABLE `km_request` DISABLE KEYS */;
INSERT INTO `km_request` (`req_id`, `req_mb_id`, `receiver_email`, `req_status`, `board_name`, `board_type`, `post_url`, `keyword`, `parsing_config`, `parsing_type`, `start_date`, `end_date`, `pay_type`, `pay_amount`, `reg_datetime`) VALUES
	(1, 'modeller@naver.com', 'modeller@naver.com', 'close', '알파룸', 'notice', 'http://alpha1room.cafe24.com/bbs/board.php?bo_table=notice', '테스트', '{"container":{"tag":"div","id":"view_2"},"title":{"tag":"font","size":"3"},"date":{"tag":"font","color":"#00BFFF"},"link":"date_based","parsing_type":"text"}', 'text', '2025-01-01', '2025-12-30', 'free', 0, '2025-05-21 13:09:21'),
	(2, 'modeller@naver.com', 'modeller@naver.com', 'close', '알파룸', 'inquiry', 'http://alpha1room.cafe24.com/bbs/board.php?bo_table=inquiry', '이벤트', '{"container":{"tag":"div","style":"border:1px solid #ddd"},"title":{"tag":"div","style":"color:#505050"},"link":{"tag":"a","onclick":"trackback_send_server"},"parsing_type":"text"}', 'text', '2025-01-01', '2025-12-30', 'free', 0, '2025-05-21 13:09:21'),
	(3, 'modeller@naver.com', 'modeller@naver.com', 'open', 'PGR21 Humor', 'pgr21_humor', 'https://pgr21.com/humor/0?ss=on&sc=on&keyword=$keyword', '손흥민', '{"container":{"tag":"tr","class":"listtr"},"title":{"tag":"td","class":"tdsub","search_all":false},"date":{"tag":"td","class":"tddate","index":4},"link":{"tag":"a","href":true},"parsing_type":"text"}', 'text', '2025-01-01', '2025-12-30', 'free', 0, '2025-05-21 22:20:18'),
	(4, 'modeller@naver.com', 'modeller@naver.com', 'open', '펨코', 'fmkorea', 'https://www.fmkorea.com/search.php?mid=best&listStyle=webzine&search_keyword=$keyword&search_target=title_content&page=1', '손흥민', '{"container":{"tag":"li","class":"li"},"title":{"tag":"h3","class":"title"},"date":{"tag":"span","class":"regdate"},"link":{"tag":"a","href":true},"parsing_type":"text"}', 'text', '2025-01-01', '2025-12-30', 'free', 0, '2025-05-21 22:19:18'),
	(5, 'modeller@naver.com', 'modeller@naver.com', 'close', '희망리턴패키지', 'sbiz24_notice', 'https://www.sbiz24.kr/#/cmmn/gnrl/bbs/4?aditFieldNm1=13&pstTtl&mySearch=N&isSearch=Y', '희망리턴', '{"container":{"tag":"tr"},"title":{"tag":"td","search_all":true},"date":{"tag":"td","index":3},"link":"date_based","parsing_type":"ocr"}', 'ocr', '2025-01-01', '2025-12-30', 'free', 0, '2025-05-21 13:09:21');
/*!40000 ALTER TABLE `km_request` ENABLE KEYS */;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
