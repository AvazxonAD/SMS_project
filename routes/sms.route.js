const { Router } = require('express')
const multer = require('multer')
const upload = multer();
const router = Router()
const { 
    sendSms,
    importExcelData
} = require('../controllers/sms.controller')

const protect = require('../middlewares/auth')


router.post('/send', protect, sendSms)
router.post('/import/from/excel', protect, upload.single('file'), importExcelData)

module.exports = router