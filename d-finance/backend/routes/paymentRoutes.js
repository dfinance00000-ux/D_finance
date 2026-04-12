const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// --- 💳 PAYMENT ROUTES (D-FINANCE BACKEND) ---

/**
 * 1. Create Order
 * Frontend hit: POST /api/payments/create-order
 */
router.post('/create-order', protect, paymentController.createOrder);

/**
 * 2. Verify Payment (Manual Verification Backup)
 * Frontend hit: POST /api/payments/verify
 */
router.post('/verify', protect, paymentController.verifyAndSavePayment);

/**
 * 3. 🔥 WEBHOOK (Automation Heart)
 * Cashfree hit: POST /api/payments/webhook
 * 🚨 ALERT: Ispe 'protect' middleware kabhi mat lagana, 
 * varna Cashfree login na hone ki wajah se 401 error dega.
 */
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;