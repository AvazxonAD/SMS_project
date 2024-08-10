const { Router } = require('express')
const multer = require('multer')
const upload = multer();
const router = Router()
const { 
} = require('../controllers/sms.controller')

const protect = require('../middlewares/auth')


router.get('/page', protect)
router.post('/download', protect, upload.single('file'))

module.exports = router