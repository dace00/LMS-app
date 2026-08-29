const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.PORT),
});

module.exports = pool;