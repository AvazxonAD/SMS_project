const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.create = asyncHandler(async (req, res, next) => {
    const { clients } = req.body
    for(let client of clients){
        if(!client.lastname || !client.firstname || !client.phone){
            return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 400))
        }
        const regex = /^[1-9]\d{8}$/
        const phoneTest = regex.test(client.phone.trim())
        if(!phoneTest){
            return next(new ErrorResponse(`Telefon raqami notog'ri kiritildi : ${client.phone}`, 400))
        }
    
        const mijoz = await pool.query(`SELECT * FROM clients WHERE username ILIKE $1 AND phone = $2`, [`${client.lastname.trim()} ${client.firstname.trim()}`, client.phone.trim()])
        if(mijoz.rows[0]){
            return next(new ErrorResponse(`Ushbu mijoz avval kiritilgan : ${client.lastname} ${client.firstname}. Telefon raqami : +998${client.phone}`))
        }
    }
    
})