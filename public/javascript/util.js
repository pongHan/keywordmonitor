  /**
 * 쿠키를 설정하는 함수
 * 
 * @param {string} name 쿠키의 이름
 * @param {string} value 쿠키의 값
 * @param {number} days 쿠키의 만료 기간(일 단위)
 */
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

/**
 * 쿠키 값을 불러오는 함수
 * 
 * @param {string} name 불러올 쿠키의 이름
 * @return {string} 해당 쿠키의 값 (쿠키가 존재하지 않으면 빈 문자열 반환)
 */
 function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';'); // 쿠키를 세미콜론으로 분리하여 배열로 변환
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length); // 문자열 앞의 공백 제거
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length); // 쿠키 이름이 일치하면 값을 반환
    }
    return ""; // 일치하는 쿠키가 없으면 빈 문자열 반환
}

//var username = getCookie("username"); // 'username' 쿠키의 값을 불러옵니다.
//console.log(username);

