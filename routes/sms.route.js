const { Router } = require('express')
const multer = require('multer')
const upload = multer();
const router = Router()
const { 
    sendSms
} = require('../controllers/sms.controller')

const protect = require('../middlewares/auth')


router.post('/send', protect, sendSms)

module.exports = router