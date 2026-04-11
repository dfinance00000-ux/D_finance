const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// --- 💳 PAYMENT ROUTES ---

// 1. Create Cashfree Order (Frontend calls this first)
// URL: /api/payments/create-order
router.post('/create-order', protect, paymentController.createOrder);

// 2. Verify Payment Status & Update Atlas (Frontend calls this after checkout)
// URL: /api/payments/verify
router.post('/verify', protect, paymentController.verifyAndSavePayment);

module.exports = router;