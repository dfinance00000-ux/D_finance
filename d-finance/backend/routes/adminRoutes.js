const express = require('express');
const router = express.Router();

// 1. Models Import
const User = require('../models/User');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment'); // 🔥 Added Payment Model

// 2. Middleware & Controller Import
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const loanController = require('../controllers/loanController'); // 🔥 Ensure controller is linked

// --- 📊 DASHBOARD STATS ---
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const loans = await Loan.find();
        const customerCount = await User.countDocuments({ role: 'user' });
        const totalDisbursed = loans.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        let totalRecovered = 0;
        loans.forEach(loan => {
            loan.repaymentHistory?.forEach(pay => {
                // Check for 'Approved' or 'Success' status
                if (pay.status === 'Approved' || pay.status === 'Success') {
                    totalRecovered += (pay.amount || 0);
                }
            });
        });

        res.json({ totalDisbursed, totalRecovered, customerCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 💰 PAYMENT VERIFICATION (Accountant/Admin Terminal) ---

// 🔥 1. Get All Pending Manual Payments (Accountant Page Load)
router.get('/pending-payments', verifyToken, isAdmin, async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔥 2. Approve Payment (Deducts balance & adds to loan history)
router.post('/approve-payment/:id', verifyToken, isAdmin, loanController.approvePayment);

// 🔥 3. Reject & Delete Payment Receipt (Fixes your "Delete ni ho rha" issue)
router.delete('/reject-payment/:id', verifyToken, isAdmin, loanController.rejectPayment);


// --- 👥 USER & STAFF MANAGEMENT ---

router.get('/all-customers', verifyToken, isAdmin, async (req, res) => {
    try {
        const customers = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/all-staff', verifyToken, isAdmin, async (req, res) => {
    try {
        const staff = await User.find({ role: { $ne: 'user' } }).select('-password').sort({ role: 1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/collection-report', verifyToken, isAdmin, async (req, res) => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);
        const loans = await Loan.find();
        let report = [];
        loans.forEach(loan => {
            loan.repaymentHistory?.forEach(pay => {
                const payDate = new Date(pay.date || pay.paymentDate).setHours(0, 0, 0, 0);
                if (payDate === today && (pay.status === 'Approved' || pay.status === 'Success')) {
                    report.push({
                        ...pay.toObject ? pay.toObject() : pay,
                        loanId: loan.loanId,
                        customerName: loan.customerName
                    });
                }
            });
        });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;