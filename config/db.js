const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  password: '1101jamshid',
  database: 'sms_otp',
  user: 'postgres'
})

module.exports = pool;
