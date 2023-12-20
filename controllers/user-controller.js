const userService = require('../service/user-service')
const db = require('../db')
const ApiError = require('../exceptions/api-error')
const {validationResult} = require('express-validator')

class UserController {

    async registration(req, res, next) {         // Это проверка уже существования и, если нету, то создание НОВОГО ПОЛЬЗОВАТЕЛЯ
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка валидации входящих данных', errors.array()));
            }
            const {email, password} = req.body;
            const candidate = await db.query(`SELECT * FROM userschema WHERE email = $1`,[email])
            if (candidate.rows[0]) {
                throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
                //throw new Error("Пользователь с почтовым адресом ${email} уже существует")
                //return res.send(`Пользователь с почтовым адресом ${email} уже существует`);
            } //else {
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 15*24*60*60*1000, httpOnly: true}); // в куки передаю refreshToken
            return res.json(userData)
            //}
        } catch (e) {
            next(e); //console.log(/*'ошибка'*/e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 15*24*60*60*1000, httpOnly: true}); // в куки передаю refreshToken
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {      // Это активация ПОЛЬЗОВАТЕЛЯ по ссылке на эндпоинт activate, отправленной Пользователю на Почту
        try {
            const activationlink = req.params.link;     // потому-что router.get('/activate/:link', userController.activate)
            await userService.activate(res, activationlink);
            //return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
            //console.log(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 15*24*60*60*1000, httpOnly: true}); // в куки передаю refreshToken
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController()