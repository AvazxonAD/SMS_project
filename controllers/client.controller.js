const pool = require("../config/db");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const xlsx = require('xlsx')

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
    const { lastname, firstname, phone } = req.body
    if (!lastname || !firstname || !phone) {
        return next(new ErrorResponse("So'rovlar bo'sh qolishi mumkin emas", 400))
    }
    const regex = /^[1-9]\d{8}$/
    const phoneTest = regex.test(phone.trim())
    if (!phoneTest) {
        return next(new ErrorResponse(`Telefon raqami notog'ri kiritildi : ${phone}. Tog'ri format : 992996937`, 400))
    }

    let client = await pool.query(`SELECT * FROM clients WHERE id = $1`, [req.params.id])
    client = client.rows[0]
    if (client.username !== `${lastname.trim()} ${firstname.trim()}` && client.phhone !== phone.trim()) {
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
    if (!client) {
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
    if (!client) {
        return next(new ErrorResponse("server xatolik", 404))
    }

    res.status(200).json({
        success: true,
        data: client
    })
})

// search client 
exports.search = asyncHandler(async (req, res, next) => {
    const { username } = req.body;

    if (!username) {
        return next(new ErrorResponse('So‘rovlar bo‘sh qolmasligi kerak', 400));
    }

    const usernameTrimmed = username.trim().toLowerCase();
    const searchPattern = `%${usernameTrimmed}%`;

    let client = await pool.query(
        `SELECT * FROM clients 
        WHERE regexp_replace(lower(username), '[^\\w]', '', 'g') LIKE $1`,
        [searchPattern]
    );

    client = client.rows[0];
    if (!client) {
        return next(new ErrorResponse('Client topilmadi', 400));
    }
    return res.status(200).json({
        success: true,
        data: client
    });
});

// for checked 
exports.forchecked = asyncHandler(async (req, res, next) => {
    const clients = await pool.query(`SELECT * FROM clients ORDER BY username`)
    res.status(200).json({
        success: true,
        data: clients.rows
    })
})

// import excel 
exports.importExcel = asyncHandler(async (req, res, next) => {
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
        if (!rowData.username) {
            return next(new ErrorResponse(`FIO bo'sh qolishi mumkin emas. Excel faylni tekshiring`, 400));
        }
        if (typeof rowData.username !== "string") {
            return next(new ErrorResponse(`Ma'lumotlar matn formatida bo'lishi kerak. Excel ustunini tekshiring`, 400));
        }
        const regex = /^[1-9]\d{8}$/
        const phoneTest = regex.test(rowData.phone.toString().trim())
        if (!phoneTest) {
            return next(new ErrorResponse(`Telefon raqami notog'ri kiritildi : ${rowData.phone}. Tog'ri format : 992996937`, 400))
        }
        const mijoz = await pool.query(`SELECT * FROM clients WHERE username ILIKE $1 AND phone = $2`, [rowData.username.trim(), rowData.phone.toString().trim()])
        if (mijoz.rows[0]) {
            return next(new ErrorResponse(`Ushbu mijoz avval kiritilgan : ${rowData.username}. Telefon raqami : +998${rowData.phone}`))
        }
    }

    for (let client of data) {
        await pool.query(`INSERT INTO clients(username, phone) VALUES($1, $2)`, [client.username, client.phone])
    }

    return res.status(201).json({
        success: true,
        data: "Kiritildi"
    });
})

// export excel 
exports.exportExcel = asyncHandler(async (req, res, next) => {
    const clients = await pool.query(`SELECT * FROM clients ORDER BY username`)
    const worksheetData = clients.rows.map(data => ({
        'id': data.id,
        'username': data.username,
        'phone': data.phone
    }));

    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    worksheet['!cols'] = [{ width: 10 }, { width: 80 }, { width: 30 }];
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Mijozlar');

    const buffer = xlsx.write(workbook, { type: 'buffer' });
    const filename = `${Date.now()}_data.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
})