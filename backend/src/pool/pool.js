const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.PORT),
    ssl: {
        rejectUnauthorized: false,
    }
});

module.exports = pool;