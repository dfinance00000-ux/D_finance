// adminRoutes.js ya jahan aapke admin routes hain
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Path check kar lena

// 🔥 Yeh route hona zaroori hai
router.delete('/reject-payment/:id', adminController.rejectPayment);

module.exports = router;