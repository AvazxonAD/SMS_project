const { Router } = require('express')
const multer = require('multer')
const upload = multer();
const router = Router()
const { 
  smsPage,
  smsDownload
} = require('../controllers/sms.controller')

const protect = require('../middlewares/auth')


router.get('/page', protect,  smsPage)
router.post('/download', protect, upload.single('file'), smsDownload)

module.exports = router