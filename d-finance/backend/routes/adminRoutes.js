const express = require('express');
const router = express.Router();

// 1. Models Import (Check paths: models folder ke hisaab se)
const User = require('../models/User');
const Loan = require('../models/Loan');

// 2. Middleware Import (Auth check ke liye)
const { verifyToken, isAdmin } = require('../middleware/auth'); 

// --- ROUTES ---

// 1. STATS: Dashboard Graphs aur Top Cards ke liye
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const loans = await Loan.find();
        const customerCount = await User.countDocuments({ role: 'user' });

        const totalDisbursed = loans.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        let totalRecovered = 0;
        loans.forEach(loan => {
            loan.repaymentHistory?.forEach(pay => {
                if (pay.status === 'Approved') totalRecovered += (pay.amount || 0);
            });
        });

        res.json({ totalDisbursed, totalRecovered, customerCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ALL CUSTOMERS: Customer Directory tab ke liye
router.get('/all-customers', verifyToken, isAdmin, async (req, res) => {
    try {
        const customers = await User.find({ role: 'user' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ALL STAFF: Team/Staff tab ke liye
router.get('/all-staff', verifyToken, isAdmin, async (req, res) => {
    try {
        const staff = await User.find({ role: { $ne: 'user' } })
            .select('-password')
            .sort({ role: 1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. COLLECTION REPORT: Today's Recovery tab ke liye
router.get('/collection-report', verifyToken, isAdmin, async (req, res) => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);
        const loans = await Loan.find();
        
        let report = [];
        loans.forEach(loan => {
            loan.repaymentHistory?.forEach(pay => {
                const payDate = new Date(pay.date || pay.paymentDate).setHours(0, 0, 0, 0);
                if (payDate === today && pay.status === 'Approved') {
                    report.push({
                        ...pay.toObject(),
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

// 5. DELETE USER: Kisi ko remove karne ke liye
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;