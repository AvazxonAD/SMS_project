const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require('../utils/errorResponse')
const pool = require('../config/db.js');
const returnSumma = require("../utils/returnSumma.js");
const generateTransmitAccessToken = require('../utils/access.js')
const uuid = require('uuid')
const axios = require('axios');
const { returnLocalDate, returnDate } = require("../utils/date.functions.js");

exports.sendSmsXorazm = asyncHandler(async (req, res, next) => {
    if(!req.user){
        return next(new ErrorResponse('Unable to enter'))
    }

    let user = await pool.query(`SELECT * FROM users WHERE id = $1`, [2])
    user = user.rows[0]
    if(!user){
        return next(new ErrorResponse("server xatolik", 500))
    }

    const { clients } = req.body;
    if(!clients){
        return next(new ErrorResponse('clinets array bo`sh'))
    }

    for (let client of clients) {
        if (!client.fio || !client.summa || !client.phone) {
            return next(new ErrorResponse(`So'rovlar bo'sh qolishi mumkin emas`, 400));
        }
        if (!Number.isInteger(client.summa)) {
            return next(new ErrorResponse(`Summa noto'g'ri kiritildi: ${client.summa}`, 400));
        }
        const regex = /^[1-9]\d{8}$/
        const phoneTest = regex.test(client.phone.trim())
        if(!phoneTest){
            return next(new ErrorResponse(`Telefon raqami notog'ri kiritilgan. Xato sababchisi: ${client.phone}`, 400))
        }
    }

    const responseData = []
    // SMS API
    for (let client of clients) {
        const sendMessage = `Hurmatli ${client.fio} Xorazim viloyati Milliy gvardiyasi Qo'riqlash boshqarmasi sizga Qo'riqlash hizmati bo'yicha ${returnSumma(client.summa)} so'm qarzingiz mavjudligini eslatib o'tamiz. To'lovlarni Payme, Uzum bank, Click ilovalari orqali amalga oshirishingiz mumkin. Aloqa telefonlari: +998930883434 +998939539444`;
        const utime = Math.floor(Date.now() / 1000); 
        const accessToken = generateTransmitAccessToken('qorakolqch', process.env.SECRETKEY, utime)
        const data = {
            utime, 
            username: 'qorakolqch',
            service: {
                service: 1  
            },
            message: {
                smsid: uuid.v4(), 
                phone: `998${client.phone}`,       
                text: sendMessage
            }
        };
        const response = await axios.post('https://routee.sayqal.uz/sms/TransmitSMS', data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': accessToken 
            }
        })
        if(response.status === 200){
            responseData.push({
                fio: client.fio, 
                phone: client.phone,
                success: true
            })
            await pool.query(
                `INSERT INTO reports (report, senddate, user_id) VALUES ($1, $2, $3)`,
                [sendMessage, new Date(), user.id]
            );
        }

        if(response.status !== 200){
            responseData.push({
                fio: client.fio, 
                phone: client.phone,
                success: false
            })
        }
    }
    return res.status(200).json({
        success: true,
        data: responseData
    });
})

// get all dates 
exports.getAllDates = asyncHandler(async (req, res, next) => {
    let user = await pool.query(`SELECT * FROM users WHERE id = $1`, [2])
    user = user.rows[0]
    if(!user){
        return next(new ErrorResponse("server xatolik", 500))
    }

    const dates = await pool.query(`SELECT DISTINCT(senddate) FROM reports WHERE  user_id = $1 ORDER BY senddate 
        `, [user.id])
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
    let user = await pool.query(`SELECT * FROM users WHERE id = $1`, [2])
    user = user.rows[0]
    if(!user){
        return next(new ErrorResponse("server xatolik", 500))
    }

  const smses = await pool.query(
    `SELECT id, report, senddate, user_id
     FROM reports
     WHERE senddate = $1 AND user_id = $2`,
    [returnDate(req.query.date), user.id]
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
