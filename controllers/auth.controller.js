const ErrorResponse = require('../utils/errorResponse');
const pool = require('../config/db');
const asyncHandler = require('../middlewares/asyncHandler');
const generateToken = require('../utils/ganerate.token');
const bcrypt = require('bcrypt');

// login 
exports.login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ErrorResponse("So'rovlar bo'sh qolishi mumkin emas", 400));
    }
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

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
    const result = await pool.query('SELECT username, id FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
        return next(new ErrorResponse("Foydalanuvchi topilmadi", 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// update users 
exports.update = asyncHandler(async (req, res, next) => {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
        return next(new ErrorResponse("So'rovlar bo'sh qolmasligi kerak", 400));
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
        return next(new ErrorResponse("Foydalanuvchi topilmadi", 404));
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
        return next(new ErrorResponse("Eski parol noto'g'ri", 403));
    }
    
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[^\s]{8,}$/;
    if (!regex.test(newPassword)) {
        return next(new ErrorResponse("Parol kamida 8 ta belgidan iborat bo'lishi, harflar va raqamlarni o'z ichiga olishi kerak", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await pool.query('UPDATE users SET username = $1, password = $2 WHERE id = $3 RETURNING *', [username, hashedPassword, req.user.id]);

    return res.status(200).json({
        success: true,
        data: updatedUser.rows[0]
    });
});
