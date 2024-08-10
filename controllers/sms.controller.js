const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const returnSumma = require('../utils/returnSumma')

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

    // SMS API
    for (let client of clients) {
        let clientBaza = await pool.query(`SELECT * FROM clients WHERE id = $1`, [client.id]);
        clientBaza = clientBaza.rows[0];
        const sendMessage = `Navoiy viloyati Milliy gvardiya qo‘riqlash boshqarmasi nomidan. Hurmatli ${clientBaza.username}. Sizda xonadon qo‘rig‘I bo‘yicha ${returnSumma(client.summa)} so‘m qarzdorlik bor. To‘lovni Paymi, Uzum bank, Click ilovalari orqali to‘lashingiz mumkin.Aloqa telefonlari: 939539444, 934632828.`;
        // Yuborildi
        await pool.query(
            `INSERT INTO reports (client_id, report, senddate) VALUES ($1, $2, $3)`,
            [client.id, sendMessage, new Date()]
        );
    }

    return res.status(200).json({
        success: true,
        data: "Send true"
    });
});