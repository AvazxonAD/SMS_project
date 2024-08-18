const express = require('express');
const {
    createRegion,
    getRegions,
    updateRegion,
    deleteRegion
} = require('../controllers/region.controller');

const protect = require('../middlewares/auth')

const router = express.Router();

router.post('/create', protect, createRegion); // Yangi region qo'shish
router.get('/get', protect, getRegions); // Barcha regionlarni olish
router.put('/update/:id', protect, updateRegion); // Regionni yangilash
router.delete('/delete/:id', protect, deleteRegion); // Regionni o'chirish

module.exports = router;
