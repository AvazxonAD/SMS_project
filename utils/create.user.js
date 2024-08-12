const pool = require("../config/db")

module.exports = async () => {
    const user = await pool.query(`SELECT * FROM users`)
    if(user.rows.length < 1){
        await pool.query(`INSERT INTO users(username, password) VALUES($1, $2)`, ['sms', '123'])
        return;
    }
    return;
}