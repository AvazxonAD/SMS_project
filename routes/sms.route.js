const { Router } = require('express')
const router = Router()
const { 
  smsPage,
  smsDownload
} = require('../controllers/sms.controller')

const protect = require('../middlewares/auth')

const upload = require('../utils/fileUpload')

router.get('/page', protect,  smsPage)
router.post('/download', protect, upload.single('file'), smsDownload)

module.exports = router