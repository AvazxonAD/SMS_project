const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const {
    returnLocalDate,
    returnDate
} = require('../utils/date.functions')

// get all dates 
exports.getAllDates = asyncHandler(async (req, res, next) => {
    if(!req.user){
      return next(new ErrorResponse('Unable to enter', 403))
    }
    const dates = await pool.query(`SELECT DISTINCT(senddate) FROM reports WHERE user_id = $1 ORDER BY senddate`, [req.user.id])
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
    `SELECT reports.id, reports.client_id, reports.report, reports.senddate,
            clients.username, clients.phone
     FROM reports
     JOIN clients ON reports.client_id = clients.id
     WHERE reports.senddate = $1 AND user_id = $2`,
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
  if(!report){
      return next(new ErrorResponse('server xatolik', 500))
  }
  return res.status(200).json({
      success: true,
      data: report
  })
})
