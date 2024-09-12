const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const {
  returnLocalDate,
  returnDate
} = require('../utils/date.functions')

// get all dates 
exports.getAllDates = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Unable to enter', 403))
  }
  const dates = await pool.query(`SELECT DISTINCT(senddate) FROM reports WHERE user_id = $1 ORDER BY senddate DESC`, [req.user.id])
  const result = dates.rows.map(date => {
    return returnLocalDate(date.senddate)
  })
  res.status(200).json({
    success: true,
    data: result
  })
})

// get all reports 
exports.getAllSmses = asyncHandler(async (req, res, next) => {
  const smses = await pool.query(
    `SELECT id, report, client_fio AS username, senddate, client_phone AS phone
    FROM reports
     WHERE senddate = $1 AND user_id = $2`,
    [returnDate(req.query.date), req.user.id]
  );

  const result = smses.rows.map(report => {
    report.senddate = returnLocalDate(report.senddate)
    return report
  })

  res.status(200).json({
    success: true,
    data: result
  })
})

// delete 
exports.deleteReport = asyncHandler(async (req, res, next) => {
  let report = await pool.query(`DELETE FROM reports where id = $1 RETURNING *`, [req.params.id])
  report = report.rows[0]
  if (!report) {
    return next(new ErrorResponse('server xatolik', 500))
  }
  return res.status(200).json({
    success: true,
    data: report
  })
})

// search by  phone 
exports.searchByPhone = asyncHandler(async (req, res, next) => {
  const { phone } = req.body
  if (!phone) {
    return next(new ErrorResponse('So`rovlar bosh qolishi mumkin emas', 400))
  }

  if (typeof phone !== "string") {
    return next(new ErrorResponse('Malumotlar tog`ri formatda kiritilishi kerak'))
  }

  const regex = /^[1-9]\d{8}$/
  const phoneTest = regex.test(phone.trim())
  if (!phoneTest) {
    return next(new ErrorResponse(`Telefon raqami notog'ri kiritildi : ${phone}. Tog'ri format : 992996937`, 400))
  }

  const result = await pool.query(`SELECT id, report, client_fio AS username, senddate, client_phone AS phone 
    FROM reports WHERE user_id = $1 AND client_phone = $2
  `, [req.user.id, phone])
    
  return res.status(200).json({
    success: true,
    data: result.rows
  })

})

// get elemt by id 
exports.getElementById = asyncHandler(async (req, res, next) => {
  let report = await pool.query(`SELECT id, report, client_fio AS username, senddate, client_phone AS phone  
    FROM reports WHERE user_id = $1 AND id = $2
  `, [req.user.id, req.params.id])
  
  report = report.rows[0]
  if(!report){
    return next(new ErrorResponse("Server xatolik. Xisobot topilmadi", 500))
  }

  return res.status(200).json({
    success: true, 
    data: report
  })
  
})