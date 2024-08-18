const { Router } = require('express')
const router = Router()

const { 
    getAllClients,
    create,
    update,
    deleteClient,
    getelementByid,
    search,
    forchecked,
    importExcel,
    exportExcel,
    searchOneRegion
} = require('../controllers/client.controller')

const protect = require('../middlewares/auth')
const upload = require('multer')()

router.get('/get/:id', protect, getAllClients)
router.post('/create/:id', protect, create)
router.put('/update/:id', protect, update)
router.delete('/delete/:id', protect, deleteClient)
router.get('/get/element/:id', protect, getelementByid)
router.post('/search', protect, search)
router.get('/for/checked', protect, forchecked)
router.post('/import/excel', protect, upload.single('file'), importExcel)
router.get('/export/to/excel', protect, exportExcel)
router.post('/search/one/region/:id', protect, searchOneRegion)

module.exports = router