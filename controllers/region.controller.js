const asyncHandler = require('../middlewares/asyncHandler');
const pool = require('../config/db');
const ErrorResponse = require('../utils/errorResponse');

// Create (yangi yozuv qo'shish)
exports.createRegion = asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    if(!name || typeof name !== "string"){
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 400))
    }
    const test = await pool.query(`SELECT * FROM regions WHERE name = $1 AND user_id = $2`, [name.trim(), req.user.id])
    if(test.rows[0]){
        return next(new ErrorResponse(`bu viloyat avval kiritilgan: ${name}`))
    }
    const result = await pool.query(
        'INSERT INTO regions (name, user_id) VALUES ($1, $2) RETURNING *',
        [name.trim(), req.user.id]
    );
    res.status(201).json({
        success: true,
        data: result.rows[0]
    });
});

exports.getRegions = asyncHandler(async (req, res, next) => {
    const result = await pool.query('SELECT * FROM regions WHERE user_id = $1', [req.user.id]);
    res.status(200).json({
        success: true,
        data: result.rows
    });
});

// Update (ma'lumotni yangilash)
exports.updateRegion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    if(!name || typeof name !== "string"){
        return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 400))
    }
    const test = await pool.query(`SELECT * FROM regions WHERE name = $1 AND user_id = $2`, [name.trim(), req.user.id])
    if(test.rows[0]){
        return next(new ErrorResponse(`bu viloyat avval kiritilgan: ${name}`))
    }
    const result = await pool.query(
        'UPDATE regions SET name = $1 WHERE id = $2 RETURNING *',
        [name.trim(), id]
    );

    return res.status(200).json({
        success: true,
        data: result.rows[0]
    });
});

// Delete (ma'lumotni o'chirish)
exports.deleteRegion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const region = await pool.query('DELETE FROM regions WHERE id = $1 RETURNING * ', [id]);
    if(!region.rows[0]){
        return next(new ErrorResponse('server xatolik ochirilmadi', 400))
    }
    res.status(200).json({ 
        success: true,
        data: "DELETE true"
     });
});
