const jwt = require('jsonwebtoken')
const db = require('../db')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '15d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await db.query(`SELECT * FROM tokenschema WHERE user_id = $1`,[userId])
        //console.log(`token-sevice ----  tokenData = ${tokenData}`)
        if (tokenData.rows[0]) {
            tokenData.refreshToken = refreshToken;
            return await db.query('UPDATE tokenschema SET refreshToken = $2 WHERE user_id = $1 RETURNING *', [userId, tokenData.refreshToken]);
        }
        //console.log(`token-sevice ----  user_id = ${user_id}, refreshToken = ${refreshToken}`)
        const token = await db.query('INSERT INTO tokenschema (user_id, refreshtoken) values ($1, $2) RETURNING *', [userId, refreshToken]);
        return token;    
    }

    async removeToken(refreshToken) {
        const tokenData = await db.query(`DELETE FROM tokenschema WHERE refreshtoken = $1`,[refreshToken]);
        return tokenData;    
    }

    async findToken(refreshToken) {
        const tokenData = await db.query(`SELECT * FROM tokenschema WHERE refreshtoken = $1`,[refreshToken]);
        return tokenData;    
    }

}

module.exports = new TokenService()