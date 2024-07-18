const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sms',
  password: '1101jamshid',
  port: 5432, // PostgreSQL port
  ssl: false // SSL-ni o'chirish
});

module.exports = pool