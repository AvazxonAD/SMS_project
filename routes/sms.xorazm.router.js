const { Router } = require('express')
const router = Router()

const { 
    sendSmsXorazm,
    getAllDates,
    getAllSmses,
    deleteReport
} = require('../controllers/sms.xorazm')

const protect = require('../middlewares/xorazmprotect')

router.post('/sms/send', protect, sendSmsXorazm)
router.get('/get/all/dates', protect, getAllDates)
router.get('/get/reports/by/date', protect, getAllSmses)
router.delete('/delete/:id', protect, deleteReport)

module.exports = router