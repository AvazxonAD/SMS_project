const pool = require("../config/db")
const bcrypt = require('bcrypt')

module.exports = async () => {
    const user = await pool.query(`SELECT * FROM users`)
    if(user.rows.length < 1){
        await pool.query(`INSERT INTO users(username, password) VALUES($1, $2)`, ['sms', await bcrypt.hash('123', 10)])
        return;
    }
    return;
}