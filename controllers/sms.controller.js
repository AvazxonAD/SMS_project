const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const axios = require('axios')
const returnSumma = require('../utils/returnSumma')
const uuid = require('uuid')
const generateTransmitAccessToken = require('../utils/access');
const xlsx = require('xlsx')

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
        const test = await pool.query(`SELECT * FROM clients WHERE id = $1 AND user_id = $2`, [client.id, req.user.id]);
        if (!test.rows[0]) {
            return next(new ErrorResponse(`Server xatolik`, 500));
        }
    }

    const responseData = []

    const regionNames = {
        1: 'Navoiy',
        2: 'Surxondaryo',
        3: 'test'
    };
    const regionName = regionNames[req.user.id];
    if(!regionName){
        return next(new ErrorResponse('Server xatolik region topilmadi', 500))
    }

    for (let client of clients) {
        let clientBaza = await pool.query(`SELECT * FROM clients WHERE id = $1 AND user_id = $2`, [client.id, req.user.id]);
        clientBaza = clientBaza.rows[0];
        const sendMessage = `Hurmatli ${clientBaza.username} ${regionName} viloyati Milliy gvardiyasi Qo'riqlash boshqarmasi sizga Qo'riqlash hizmati bo'yicha ${returnSumma(client.summa)} so'm qarzingiz mavjudligini eslatib o'tamiz. To'lovlarni Payme, Uzum bank, Click ilovalari orqali amalga oshirishingiz mumkin.`;
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
                success: true
            })
            await pool.query(
                `INSERT INTO reports (client_fio, client_phone, report, senddate, user_id) VALUES ($1, $2, $3, $4, $5)`,
                [clientBaza.username, clientBaza.phone, sendMessage, new Date(), req.user.id]
            );
        }

        if(response.status !== 200){
            responseData.push({
                username: clientBaza.username, 
                phone: clientBaza.phone,
                success: false
            })
        }
    }
    return res.status(200).json({
        success: true,
        data: responseData
    });
});

// import excel data 
exports.importExcelData = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse("Fayl yuklanmadi", 400));
    }

    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet).map(row => {
        const newRow = {};
        for (const key in row) {
            newRow[key.trim()] = row[key];
        }
        return newRow;
    });
    for (const rowData of data) {
        if(!rowData.username || !rowData.phone){
            return next(new ErrorResponse('sorovlar bosh qolishi mumkin emas', 400))
        }
        if(!rowData.id){
            return next(new ErrorResponse(`id bosh  bolishi  mumkin emas yoki numberdan boshqa tip bolishi mumkin emas. Xato sababchisi : ${rowData.id}`, 400))
        }
        if(!rowData.summa || typeof rowData.summa !== "number"){
            return next(new ErrorResponse(`summa bosh  bolishi  mumkin emas yoki numberdan boshqa tip bolishi mumkin emas. Xato sababchisi ID raqami: ${rowData.id}`, 400))
        }
        const mijoz = await pool.query(`SELECT * FROM clients WHERE id = $1 AND username = $2 AND phone = $3 AND user_id = $4
            `, [rowData.id, rowData.username, rowData.phone, req.user.id])
        if (!mijoz.rows[0]) {
            return next(new ErrorResponse(`Mijoz topilmadi : ${rowData.username}. Telefon raqami : +998${rowData.phone}. ID raqami : ${rowData.id}`))
        }
    }

    return res.status(200).json({
        success: true,
        data: data
    });
})

// send sms comfortable
exports.send_sms_comfortable = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse("Fayl yuklanmadi", 400));
    }

    const fileBuffer = req.file.buffer;
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const clients = xlsx.utils.sheet_to_json(sheet).map(row => {
        const newRow = {};
        for (const key in row) {
            newRow[key.trim()] = row[key];
        }
        return newRow;
    });

    for (let client of clients) {
        if (!client.fio || !client.summa || !client.phone) {
            return next(new ErrorResponse(`So'rovlar bo'sh qolishi mumkin emas`, 400));
        }
        if (!Number.isInteger(client.summa)) {
            return next(new ErrorResponse(`Summa noto'g'ri kiritildi: ${client.summa}`, 400));
        }
    }

    const responseData = []

    const regionNames = {
        1: 'Navoiy',
        2: 'Surxondaryo',
        3: 'test'
    };
    const regionName = regionNames[req.user.id];
    if(!regionName){
        return next(new ErrorResponse('Server xatolik region topilmadi', 500))
    }

    for (let client of clients) {
        const sendMessage = `Hurmatli ${client.fio} ${regionName} viloyati Milliy gvardiyasi Qo'riqlash boshqarmasi sizga Qo'riqlash hizmati bo'yicha ${returnSumma(client.summa)} so'm qarzingiz mavjudligini eslatib o'tamiz. To'lovlarni Payme, Uzum bank, Click ilovalari orqali amalga oshirishingiz mumkin.`;
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
                username: client.fio, 
                phone: client.phone,
                success: true
            })
            await pool.query(
                `INSERT INTO reports (report, senddate, user_id, client_fio, client_phone) VALUES ($1, $2, $3, $4, $5)`,
                [sendMessage, new Date(), req.user.id, client.fio, client.phone]
            );
        }

        if(response.status !== 200){
            responseData.push({
                username: client.fio, 
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