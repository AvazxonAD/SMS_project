const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const axios = require('axios');
const returnToken  = require('../utils/create.token'); // Token olish funksiyasini to'g'ri import qiling

// sms page 
exports.smsPage =async  (req, res) => {
    try {
        req.session.islogged = true;
        await req.session.save();
        return res.render('sms/index', {
            title: 'sms',
            errorMessage: req.flash('error'),
            message: req.flash('success'),
            islogged: req.session.islogged
        });
    } catch (error) {
        console.log(error);
    }
}

// sms download 
exports.smsDownload = async (req, res) => {
    try {
        req.session.islogged = true;
        await req.session.save();
        if (!req.file) {
            req.flash('error', `Fayl kiriting`);
            return res.redirect('/sms/page');
        }
        const filePath = path.join(__dirname, '..', req.file.path);

        if (!fs.existsSync(filePath)) {
            req.flash('error', `Fayl topilmadi: ${filePath}`);
            return res.redirect('/sms/page');
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let data = xlsx.utils.sheet_to_json(sheet);

        const datas = data.map(row => {
            const newRow = {};
            for (let key in row) {
                const newKey = key.trim(); 
                newRow[newKey] = row[key];
            }
            return newRow;
        });

        for (let rowData of datas) {
            if (!rowData.message || !rowData.phone) {
                req.flash('error', 'Excel faylida telefon raqam va xabar matnni to\'ldiring');
                return res.redirect('/sms/page');
            }

            const phoneRegex = /^[0-9]{9}$/;
            const test = phoneRegex.test(rowData.phone);
            if (!test) {
                req.flash('error', `Telefon raqam noto'g'ri formatda: ${rowData.phone}. Bunday kiriting: 992996937`);
                return res.redirect('/sms/page');
            }
        }

        const base_url = process.env.ESKIZ_BASE_URL;
        const api = `${base_url}message/sms/send`;

        const token = await returnToken();

        const headers = {
            headers: {
                Authorization: `Bearer ${token.data.token}`
            }
        };
        for (let rowData of datas) {
            const forSms = {
                mobile_phone: `998${rowData.phone}`,
                message: `${rowData.message}`,
                from: "4546"
            };
            const response = await axios.post(api, forSms, headers);
        }

        // Faylni o'chirish
        await fs.promises.unlink(filePath);

        req.flash('success', 'Excel fayli muvaffaqiyatli yuklandi');
        return res.redirect('/sms/page');

    } catch (error) {
        //console.log(error);
        req.flash('error', 'server xatolik');
        return res.redirect('/sms/page');
    }
}