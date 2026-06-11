const express = require('express');
const router = express.Router();
const cashfreeController = require('../controllers/cashfreeController');

// 🔥 FIX: Frontend se aane wali 'POST /api/payments/create-order' ko catch karne ke liye exact path
router.post('/create-order', cashfreeController.createEmiPaymentOrder);

// Webhook status syncing route
router.post('/cashfree/webhook', cashfreeController.handleWebhook);

// Individual order status checking route
router.get('/status/:orderId', cashfreeController.getPaymentStatus);
// backend/routes/paymentRoutes.js ke andar:
// 🛡️ Webhook par verifyToken nahi lagana hai, ise public rakhein
router.post('/cashfree/webhook', cashfreeController.handleWebhook);
module.exports = router;