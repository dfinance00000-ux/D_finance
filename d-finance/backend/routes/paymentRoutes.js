const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// --- 💳 PAYMENT ROUTES (D-FINANCE BACKEND) ---

/**
 * 1. Create Order
 * User jab checkout shuru karega tab order generate hoga
 */
router.post('/create-order', protect, paymentController.createOrder);

/**
 * 2. Verify Payment
 * Payment ke turant baad frontend se verify karne ke liye
 */
router.post('/verify', protect, paymentController.verifyAndSavePayment);

/**
 * 3. 🔥 WEBHOOK (Automation Heart)
 * Cashfree background mein ledger settle karne ke liye ise call karega.
 * 🚨 Note: Ispe auth middleware (protect) NAHI lagana hai.
 */
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;