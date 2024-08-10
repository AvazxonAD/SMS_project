const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// to send sms 
exports.sendSms = asyncHandler(async (req, res, next) => {
    const {clients} = req.body
    for(let client of clients){
        if(!client.id || !client.summa){
            return next(new ErrorResponse(`so'rovlar bo'sh qolishi mumkin emas`, 400))
        }
        const test = await pool.query(`SELECT * FROM clients WHERE id = $1`, [client.id])
        if(!test.rows[0]){
            return next(new ErrorResponse(`server xatolik`, 500))
        }
    }
    
})