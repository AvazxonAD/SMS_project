const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const axios = require('axios')
const returnSumma = require('../utils/returnSumma')
const uuid = require('uuid')
const generateTransmitAccessToken = require('../utils/access');
const { returnLocalDate } = require("../utils/date.functions");

// to send sms 
exports.sendSms = asyncHandler(async (req, res, next) => {
    const { clients } = req.body;

    for (let client of clients) {
        if (!client.id || !client.summa) {
            return next(new ErrorResponse(`So'rovlar bo'sh qolishi mumkin emas`, 400));
        }
        if (!Number.isInteger(client.summa)) {
            return next(new ErrorResponse(`Summa noto'g'ri kiritildi: ${client.summa}`, 400));
        }
        const test = await pool.query(`SELECT * FROM clients WHERE id = $1`, [client.id]);
        if (!test.rows[0]) {
            return next(new ErrorResponse(`Server xatolik`, 500));
        }
    }

    const responseData = []
    // SMS API
    for (let client of clients) {
        let clientBaza = await pool.query(`SELECT * FROM clients WHERE id = $1`, [client.id]);
        clientBaza = clientBaza.rows[0];
        const sendMessage = `Navoiy viloyati Milliy Gvardiya qo'riqlash boshqarmasi nomidan. Hurmatli ${clientBaza.username}. Sizda xonadon qong'irog'i bo'yicha ${returnSumma(client.summa)} so'm qarzdorlik bor. To'lovni Paymi, Uzum bank, Click ilovalari orqali to'lashingiz mumkin.Aloqa telefonlari: 939539444, 934632828.`;
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
                phone: `998${clientBaza.phone}`,       
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
                username: clientBaza.username, 
                phone: clientBaza.phone,
                message: sendMessage,
                date: returnLocalDate(new Date()),
                success: true
            })
            await pool.query(
                `INSERT INTO reports (client_id, report, senddate) VALUES ($1, $2, $3)`,
                [client.id, sendMessage, new Date()]
            );
        }

        if(response.status !== 200){
            responseData.push({
                username: clientBaza.username, 
                phone: clientBaza.phone,
                message: sendMessage,
                date: returnLocalDate(new Date()),
                success: false
            })
        }
    }
    return res.status(200).json({
        success: true,
        data: responseData
    });
});