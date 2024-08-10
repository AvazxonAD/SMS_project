const ErrorResponse = require('../utils/errorResponse')
const pool = require('../config/db')
const asyncHandler = require('../middlewares/asyncHandler')
const generateToken = require('../utils/ganerate.token')
const bcrypt = require('bcrypt')

// login 
exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ErrorResponse("So'rovlar bo'sh qolishi mumkin emas", 400));
    }
    
    let result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    let user = result.rows[0];

    if (!user) {
        return next(new ErrorResponse("Username yoki parol xato kiritildi", 403));
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return next(new ErrorResponse("Username yoki parol xato kiritildi", 403));
    }

    const token = generateToken(user);

    return res.status(200).json({
        success: true,
        data: user.username,
        token
    });
});


// get profile 
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await pool.query(`SELECT * FROM users`)
    res.status(200).json({
        success: true,
        data: user.rows[0]
    })
})

// update users 
exports.update = asyncHandler(async (req, res, next) => {
    let user = await pool.query(`SELECT * FROM users`)
    user = user.rows[0]
    const {username, oldPassword, newPassword} = req.body
    if(!username || !oldPassword || !newPassword){
        return next(new ErrorResponse("sorovlar bo'sh qolmasligi kerak", 400))
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
        return next(new ErrorResponse("Username yoki parol xato kiritildi", 403));
    }
    const updateUser = await pool.query(`UPDATE users SET username = $1, password = $2 RETURNING *`, [username, await bcrypt.hash(newPassword, 10)])
    return res.status(200).json({
        success: true, 
        data: updateUser.rows[0]
    })
})