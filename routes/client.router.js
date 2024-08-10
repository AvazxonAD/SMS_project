const { Router } = require('express')
const router = Router()

const { 
    getAllClients,
    create,
    update,
    deleteClient,
    getelementByid
} = require('../controllers/client.controller')

const protect = require('../middlewares/auth')


router.get('/get', protect, getAllClients)
router.post('/create', protect, create)
router.put('/update/:id', protect, update)
router.delete('/delete/:id', protect, deleteClient)
router.get('/get/element/:id', protect, getelementByid)

module.exports = router