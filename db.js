const { Pool } = require('pg')

const pool = new Pool({
    user: "yura",
    password: "yura4620",
    host: "localhost",
    port: 5432,
    database: "jwt_auth_postgres"
})


module.exports = pool