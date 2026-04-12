const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// --- 💳 PAYMENT ROUTES (D-FINANCE BACKEND) ---

/**
 * 1. Create Order (Online Payment Initiation)
 * Frontend hit: POST /api/payments/create-order
 * Isse Cashfree ka payment_session_id milega.
 */
router.post('/create-order', protect, paymentController.createOrder);

/**
 * 2. Verify Payment (Direct API Check)
 * Frontend hit: POST /api/payments/verify
 * Payment khatam hone ke baad ledger refresh karne ke liye.
 */
router.post('/verify', protect, paymentController.verifyAndSavePayment);

/**
 * 3. 🔥 WEBHOOK (Automation)
 * Cashfree hit: POST /api/payments/webhook
 * 🚨 ALERT: Ispe 'protect' NAHI lagana hai.
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * 4. Manual Payment Submission (UTR Submission)
 * Agar user QR scan karke UTR dalta hai.
 */
// Agar aapka manual logic alag controller mein hai toh wahan se import karein
// router.post('/pay-manual', protect, paymentController.submitManualUTR);

module.exports = router;