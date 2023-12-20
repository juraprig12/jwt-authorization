// 3_4_Ulbi_TV_Продвинутая JWT авторизация на React и Node js. Access, refresh, активация по почте
const express = require('express')
const cors = require('cors')
// CORS позволяет серверу указать, какие домены имеют разрешение на доступ к его ресурсам. При выполнении запроса из браузера на сервер, браузер отправляет предварительный (preflight) запрос OPTIONS для проверки политики CORS сервера. Если сервер возвращает соответствующие заголовки, разрешающие доступ, то браузер выполняет основной запрос (например, GET, POST) на сервер.
const cookieParser = require('cookie-parser')
require('dotenv').config()
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware'); 

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);
app.use(errorMiddleware);

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`server started on PORT = ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()
// 51:21