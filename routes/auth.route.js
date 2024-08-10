const { Router } = require('express')
const router = Router()

const { 
    login,
    getProfile,
    update
} = require('../controllers/auth.controller')

const protect = require('../middlewares/auth')


router.post('/login', login)
router.get('/get', protect, getProfile)
router.put('/update', protect, update)

module.exports = router