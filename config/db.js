const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  password: '1101jamshid',
  database: 'sms',
  host: 'localhost',
  port: 5432
})

module.exports = pool