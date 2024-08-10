const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '1101jamshid',
  database: 'sms_otp',
  port: 5432
});

module.exports = pool;
