module.exports = {
    secretKey : '@alphaBot@', //시크릿 키
    option : {
        algorithm : "HS256", // 해싱 알고리즘
        expiresIn : "3d",  // 토큰 유효 기간
        issuer : "alphalab" // 발행자
    }
}