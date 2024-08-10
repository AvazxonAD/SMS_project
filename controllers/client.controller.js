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
            return next(new ErrorResponse(`Telefon raqami notog'ri kiritildi : ${client.phone}. Tog'ri format : 992996937`, 400))
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
            OFFSET $1
            LIMIT $2
        `, [(page - 1) * limit, limit])
    const total = await pool.query(`SELECT COUNT(id) AS total FROM clients`)

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
    const {lastname, firstname, phone} = req.body
    if(!lastname || !firstname || !phone){
        return next(new ErrorResponse("So'rovlar bo'sh qolishi mumkin emas", 400))
    }
    const regex = /^[1-9]\d{8}$/
    const phoneTest = regex.test(phone.trim())
    if (!phoneTest) {
        return next(new ErrorResponse(`Telefon raqami notog'ri kiritildi : ${phone}. Tog'ri format : 992996937`, 400))
    }

    let client = await pool.query(`SELECT * FROM clients WHERE id = $1`, [req.params.id])
    client = client.rows[0]
    if(client.username !== `${lastname.trim()} ${firstname.trim()}` && client.phhone !== phone.trim()){
        const mijoz = await pool.query(`SELECT * FROM clients WHERE username ILIKE $1 AND phone = $2`, [`${lastname.trim()} ${firstname.trim()}`, phone.trim()])
        if (mijoz.rows[0]) {
            return next(new ErrorResponse(`Ushbu mijoz avval kiritilgan : ${lastname} ${firstname}. Telefon raqami : +998${phone}`))
        }
    }
    const updateClient = await pool.query(`UPDATE clients SET username = $1, phone = $2 WHERE id = $3 RETURNING *
    `, [`${lastname.trim()} ${firstname.trim()}`, phone, req.params.id])
    
    return res.status(200).json({
        success: true,
        data: updateClient.rows[0]
    })
})

// delete 
exports.deleteClient = asyncHandler(async (req, res, next) => {
    let client = await pool.query(`DELETE FROM clients WHERE id = $1 RETURNING *`, [req.params.id])
    client = client.rows[0]
    if(!client){
        return next(new ErrorResponse('server xatolik', 500))
    }
    return res.status(200).json({
        success: true, 
        data: client
    })
})

// get elemnt by id 
exports.getelementByid = asyncHandler(async (req, res, next) => {
    let client = await pool.query(`SELECT * FROM clients WHERE id = $1`, [req.params.id])
    client = client.rows[0]
    if(!client){
        return next(new ErrorResponse("server xatolik", 404))
    }

    res.status(200).json({
        success: true,
        data: client
    })
})