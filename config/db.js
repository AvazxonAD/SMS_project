const { Pool } = require('pg');

const pool = new Pool({
  host: '147.45.107.174',
  port: 5432,
  password: '1101jamshid',
  database: 'sms_otp',
  user: 'postgres'
})

module.exports = pool;
