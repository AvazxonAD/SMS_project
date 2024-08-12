const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.pg_url
})

module.exports = pool;
