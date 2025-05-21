import requests
from bs4 import BeautifulSoup
import smtplib
from email.mime.text import MIMEText
import time
import json
import logging
import re
from urllib.parse import urljoin

# 로깅 설정
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# 이메일 설정
SENDER_EMAIL = "modeller77@gmail.com"  # 발신자 이메일
SENDER_PASSWORD = "bjdt mvji dljw ltej"  # Gmail 앱 비밀번호
RECEIVER_EMAIL = "modeller@naver.com"  # 수신자 이메일
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# JSON 설정 파일 경로
CONFIG_FILE = "config.json"
CHECK_INTERVAL = 3600  # 확인 간격 (초)
RESET_SEEN_POSTS = False  # True로 설정 시 seen_posts 초기화 (디버깅용)

def load_config():
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error("config.json file not found.")
        return []
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding JSON: {e}")
        return []

def fetch_board(url, parsing_config):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 컨테이너 태그 찾기
        container_config = parsing_config.get('container', {})
        container_tag = container_config.get('tag')
        container_attrs = {}
        if 'style' in container_config:
            container_attrs['style'] = re.compile(container_config['style'])
        elif 'class' in container_config:
            container_attrs['class'] = container_config['class']
        else:
            container_attrs = {k: v for k, v in container_config.items() if k != 'tag'}
        posts = soup.find_all(container_tag, **container_attrs)
        
        result = []
        for post in posts:
            # 제목 추출
            title_config = parsing_config.get('title', {})
            title_tag = title_config.get('tag')
            title_attrs = {k: re.compile(v) if k == 'style' else v for k, v in title_config.items() if k != 'tag'}
            title_element = post.find(title_tag, **title_attrs)
            title_text = None
            if title_element:
                # pgr21_humor의 경우 <td class="tdsub"> 내 <a> 태그에서 제목 추출
                if parsing_config.get('board_type') == 'pgr21_humor':
                    title_a = title_element.find('a')
                    title_text = title_a.text.strip() if title_a else None
                else:
                    title_text = title_element.text.strip()
            
            # 링크 추출
            link = None
            link_config = parsing_config.get('link')
            if link_config == 'date_based':
                date_config = parsing_config.get('date', {})
                date_tag = date_config.get('tag')
                date_attrs = {k: v for k, v in date_config.items() if k != 'tag'}
                date_element = post.find(date_tag, **date_attrs)
                if date_element:
                    link = f"{url}#{date_element.text.strip()}"
            else:
                link_tag_config = link_config or {}
                link_tag = link_tag_config.get('tag')
                link_attrs = {k: re.compile(v) if k == 'onclick' else v for k, v in link_tag_config.items() if k != 'tag'}
                link_element = post.find(link_tag, **link_attrs)
                if link_element and 'onclick' in link_element.attrs:
                    match = re.search(r"'(http://[^']+)'", link_element['onclick'])
                    link = match.group(1) if match else None
                elif link_element and 'href' in link_element.attrs:
                    link = urljoin(url, link_element['href'])
                if not link and title_text:
                    link = f"{url}#{title_text[:10]}"
            
            if title_text and link:
                title = re.sub(r'\s+', ' ', title_text)  # 공백 정규화
                result.append((title, link))
            else:
                logging.warning(f"Missing title or link in post at {url}")
        
        logging.debug(f"Fetched {len(result)} posts from {url}: {[(t, l) for t, l in result]}")
        return result
    except requests.RequestException as e:
        logging.error(f"Error fetching board {url}: {e}")
        return []

def send_email(subject, body):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECEIVER_EMAIL

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
            logging.info(f"Email sent: {subject}")
    except Exception as e:
        logging.error(f"Error sending email: {e}")

def main():
    seen_posts = set()  # 이미 확인한 게시물 저장
    if RESET_SEEN_POSTS:
        seen_posts.clear()
        logging.info("seen_posts cleared for debugging")
    
    while True:
        config = load_config()
        for entry in config:
            url = entry.get('url')
            keyword = entry.get('keyword')
            parsing_config = entry.get('parsing_config')
            parsing_config['board_type'] = entry.get('board_type')  # board_type 추가
            if not url or not keyword or not parsing_config:
                logging.error(f"Invalid config entry: {entry}")
                continue
            posts = fetch_board(url, parsing_config)
            for title, link in posts:
                normalized_title = re.sub(r'\s+', ' ', title.lower())
                normalized_keyword = re.sub(r'\s+', ' ', keyword.lower())
                if normalized_keyword in normalized_title and link not in seen_posts:
                    send_email(
                        subject=f"New post with keyword '{keyword}' in {url}: {title}",
                        body=f"Title: {title}\nLink: {link}"
                    )
                    seen_posts.add(link)
                elif normalized_keyword in normalized_title:
                    logging.debug(f"Post already seen: {title} at {link}")
                else:
                    logging.debug(f"No match for keyword '{keyword}' in title: {title}")
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()