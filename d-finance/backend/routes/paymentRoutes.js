const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware'); // Security ke liye

// Routes
router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verifyAndSavePayment);

module.exports = router;