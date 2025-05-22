const randToken = require('rand-token');
const jwt = require('jsonwebtoken');
const secretKey = require('../config/secretkey').secretKey;
const options = require('../config/secretkey').options;

var accessToken = {}
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;
const TOKEN_ERRORED = -1;

module.exports = {
    sign: async (user) => {
        const payload = {
           mb_id: user.mb_id,
           mb_name: user.mb_name
        };
        const result = {
            // access token 발급
            token: jwt.sign(payload, secretKey, options),
            refreshToken: randToken.uid(256)
        };
        return result;
    },
    verify: async (token) => {
        try {
            return jwt.verify(token, secretKey);
        } catch (err) {
            if (err.message === 'jwt expired') {
                console.log("Expired token");
                return TOKEN_EXPIRED;
            } else if (err.message === 'invalid token') {
                console.log("Invalid token");
                return TOKEN_INVALID;
            } else {
                console.log("Errored token");
                return TOKEN_ERRORED;
            }
        }
    },
    accessToken,
    TOKEN_EXPIRED,
    TOKEN_INVALID,
    TOKEN_ERRORED
}