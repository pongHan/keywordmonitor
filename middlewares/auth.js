const jwt = require('../modules/jwt');
const commonLib = require('../modules/common.lib.js');

const authProcess = {
    userAuth: async (req, res, next) => {
        const token = jwt.accessToken;
        
        if (commonLib.isEmptyObj(token)) {
            // 토큰 정보 없음
            res.render('login', { user: "", message: [], err: ["No token impormation. Please login again"] });
            //return res.status(400).json({ status: 400, name: 'Bad Request', message: '토큰 정보 없음', data: null });
        } else if (req.session.mb_id == undefined) {
            // 사용자 메일 정보 없음
            res.render('login', { user: "", message: [], err: ["No user email impormation. Please login again"] });
        } else if (!token.hasOwnProperty(req.session.mb_id)) {
            // 사용자 토큰 정보 없음
            res.render('login', { user: "", message: [], err: ["No user token impormation. Please login again"] });
        } else {
            // decode
            const result = await jwt.verify(token[req.session.mb_id]);
            
            if (result === jwt.TOKEN_EXPIRED) {
                // 유효기간 만료
                res.render('login', { user: "", message: [], err: ["Tokens that have expired. Please login again"] });
            } else if (result === jwt.TOKEN_INVALID) {
                // 유효하지 않는 토큰
                res.render('login', { user: "", message: [], err: ["Invalid Token. Please login again"] });
            } else if (result === jwt.TOKEN_ERRORED) {
                // 디코딩 에러
                res.render('login', { user: "", message: [], err: ["Error occurred. Please login again"] });
            } else {
                req.id = result.no;
                next();
            }
        }
    },
    adminAuth: async (req, res, next) => {
        const token = jwt.accessToken;
        
        if (commonLib.isEmptyObj(token)) {
            // 토큰 정보 없음
            res.render('admin/login', { message: "", err: "No token impormation. Please login again" });
        } else if (req.session.admin == undefined) {
            // 관리자 메일 정보 없음
            res.render('admin/login', { message: "", err: "No admin email impormation. Please login again" });
        } else if (!token.hasOwnProperty(req.session.admin)) {
            // 관리자 토큰 정보 없음
            res.render('admin/login', { message: "", err: "No admin token impormation. Please login again" });
        } else {
            // decode
            const result = await jwt.verify(token[req.session.admin]);
            
            if (result === jwt.TOKEN_EXPIRED) {
                // 유효기간 만료
                res.render('admin/login', { message: "", err: "Tokens that have expired. Please login again" });
            } else if (result === jwt.TOKEN_INVALID) {
                // 유효하지 않는 토큰
                res.render('admin/login', { message: "", err: "Invalid Token. Please login again" });
            } else if (result === jwt.TOKEN_ERRORED) {
                // 디코딩 에러
                res.render('admin/login', { message: "", err: "Error occurred. Please login again" });
            } else {
                next();
            }
        }
    }
}

module.exports = authProcess;