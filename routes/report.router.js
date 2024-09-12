const { Router } = require('express')
const multer = require('multer')
const upload = multer();
const router = Router()
const { 
    getAllDates,
    getAllSmses,
    deleteReport,
    searchByPhone,
    getElementById
} = require('../controllers/report.controller')

const protect = require('../middlewares/auth')


router.get('/get/all/dates', protect, getAllDates)
router.get('/get/reports/by/date', protect, getAllSmses) 
router.delete('/delete/:id', protect, deleteReport)
router.post('/search/by/phone', protect, searchByPhone)
router.get('/get/by/id/:id', protect, getElementById)

module.exports = router