const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// --- 💳 PAYMENT ROUTES ---

// 1. Create Cashfree Order (Frontend se initiate hota hai)
// URL: POST /api/payments/create-order
router.post('/create-order', protect, paymentController.createOrder);

// 2. Verify Payment (Frontend redirect ke baad manually trigger hota hai)
// URL: POST /api/payments/verify
router.post('/verify', protect, paymentController.verifyAndSavePayment);

// 3. 🔥 WEBHOOK: Auto-Approval & Settlement (Background Automation)
// 🚨 IMPORTANT: Ispe 'protect' nahi lagana hai!
// URL: POST /api/payments/webhook
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;