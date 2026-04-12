const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// 🚨 Sabse important: In rasta (routes) ko register karein
// Frontend hit karega: /api/payments/create-order
router.post('/create-order', paymentController.createOrder);

// Cashfree hit karega: /api/payments/webhook
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;