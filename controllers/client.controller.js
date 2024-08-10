const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// create 
exports.create = asyncHandler(async (req, res, next) => {
    const { clients } = req.body
    for (let client of clients) {
        if (!client.lastname || !client.firstname || !client.phone) {
            return next(new ErrorResponse('Sorovlar bosh qolishi mumkin emas', 400))
        }
        const regex = /^[1-9]\d{8}$/
        const phoneTest = regex.test(client.phone.trim())
        if (!phoneTest) {
            return next(new ErrorResponse(`Telefon raqami notog'ri kiritildi : ${client.phone}`, 400))
        }

        const mijoz = await pool.query(`SELECT * FROM clients WHERE username ILIKE $1 AND phone = $2`, [`${client.lastname.trim()} ${client.firstname.trim()}`, client.phone.trim()])
        if (mijoz.rows[0]) {
            return next(new ErrorResponse(`Ushbu mijoz avval kiritilgan : ${client.lastname} ${client.firstname}. Telefon raqami : +998${client.phone}`))
        }
    }

    for (let client of clients) {
        await pool.query(`INSERT INTO clients(username, phone) VALUES($1, $2)`, [`${client.lastname.trim()} ${client.firstname.trim()}`, client.phone])
    }
    return res.status(201).json({
        success: true,
        data: "CREATE true"
    })
})

// get all clients 
exports.getAllClients = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 1

    const clients = await pool.query(`
            SELECT * 
            FROM clients
            ORDER BY username 
            OFFSET $2
            LIMIT $3
        `, [req.params.id, (page - 1) * limit, limit])
    const total = await pool.query(`SELECT COUNT(id) AS total FROM clinets`, [req.params.id])

    return res.status(200).json({
        success: true,
        pageCount: Math.ceil(total.rows[0].total / limit),
        count: total.rows[0].total,
        currentPage: page,
        nextPage: Math.ceil(total.rows[0].total / limit) < page + 1 ? null : page + 1,
        backPage: page === 1 ? null : page - 1,
        data: clients.rows
    })

})

// update 
exports.update = asyncHandler(async (req, res, next) => {

})

// delete 
exports.deleteClient = asyncHandler(async (req, res, next) => {

})

// get elemnt by id 
exports.getelementByid = asyncHandler(async (req, res, next) => {

})