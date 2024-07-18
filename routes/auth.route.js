const { Router } = require('express')
const router = Router()
const { 
  getLoginPage,
  loginPost,
  logout,
  updatePage,
  updatePost
} = require('../controllers/auth.controller')

const protect = require('../middlewares/auth')

router.get('/login', getLoginPage)
router.post('/login/post', loginPost)
router.get('/logout', logout)
router.get("/update", protect, updatePage)
router.post('/update/post', protect, updatePost )

module.exports = router