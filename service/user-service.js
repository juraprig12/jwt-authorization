const db = require('../db')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dtos')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration (email, password) {
        // чтобы шифровать пароль (bcrypt) и генерировать jwt веб токен (jsonwebtoken), и для генерации рандомных строк (uuid)
        // устанавливаю модули: npm i jsonwebtoken bcrypt uuid
        
        const hashpassword = await bcrypt.hash(password, 3);
        const activationlink = uuid.v4();
        const isActivated = false;
        const user = await db.query('INSERT INTO userschema (email, password, isActivated, activationlink) values ($1, $2, $3, $4) RETURNING *', [email, hashpassword, isActivated, activationlink]);

        //Отсылка письма на почту не работает из-за настроек и изменеия политики google gmail.com, 
        //await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationlink}`);
        // а решить отсылку по другому рекомендуют тут:
        // https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a     

        const userDto = new UserDto(user); // тут спорный момент с этими моделями   id, email, isActivated   YMP9
        // const payload = { id: user.rows[0].id, email: user.rows[0].email, isactivated: user.rows[0].isactivated };
    
        const tokens = tokenService.generateTokens(/*payload*/{...userDto});  
        // 33:20 - его объяснение как и какой передается payload - понять его и переделать  YMP9
        // 31:45 - про paylod, model, Dto - ??????????????????????    YMP9

        //console.log(`user-sevice ----  userDto.id = ${userDto.id}, tokens.refreshToken = ${tokens.refreshToken}`)
        await tokenService.saveToken(userDto.id, tokens.refreshToken) // вызываю этот метод вместо строки снизу
        //await db.query('INSERT INTO tokenschema (user_id, refreshtoken) values ($1, $2) RETURNING *', [userDto.id, tokens.refreshToken]);
        
        return {...tokens, user: userDto/*payload*/} // YMP9
    }

    async activate(res, activationlink) {
        //activationlink = '62cd709b-7eb2-4a3a-9edf-8ec8332e3f6f'
        const user = await db.query(`SELECT * FROM userschema WHERE activationlink = $1`,[activationlink])
        if (!user.rows[0]) {
            return res.send(`Некорректная ссылка активации!`);
        } else {
            user.isActivated = true;
            await db.query('UPDATE userschema set isActivated = $1 WHERE activationlink = $2 RETURNING *', [user.isActivated, activationlink]);
            return res.send(`Пользователь "${user.rows[0].email}" успешно активирован`);

        }
    }

    async login(email, password) {
        const user = await db.query(`SELECT * FROM userschema WHERE email = $1`,[email])
        if (!user.rows[0]) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не найден`)
        }
        const isPassEquals = await bcrypt.compare(password, user.rows[0].password);
        if (!isPassEquals) {
            throw ApiError.BadRequest(`Неверный пароль`);
        }
        const userDto = new UserDto(user); // тут спорный момент с этими моделями   id, email, isActivated   YMP9
        const tokens = tokenService.generateTokens(/*payload*/{...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken) // вызываю этот метод вместо строки снизу
        return {...tokens, user: userDto/*payload*/} // YMP9
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDB= tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDB) {
            throw ApiError.UnauthorizedError();
        }
        const user = await db.query(`SELECT * FROM userschema WHERE id = $1`,[userData.id]);
        const userDto = new UserDto(user); 
        const tokens = tokenService.generateTokens(/*payload*/{...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken) 
        return {...tokens, user: userDto/*payload*/} // YMP9
    }

    async getAllUsers() {
        const users = await db.query(`SELECT * FROM userschema order by id`);
        return users;
    }

}

module.exports = new UserService()