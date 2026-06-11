const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Loan = require("../models/Loan");
const Payment = require("../models/Payment");

// Middleware
const { verifyToken } = require("../middlewares/authMiddleware");

// Controller
const loanController = require("../controllers/loanController");

// 🔥 DYNAMIC ROLE CHECKER ENGINE (Case-Insensitivity Protected)
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user && req.user.role) {
      const userRole = req.user.role.toLowerCase();
      // Safe matching for both 'Admin'/'admin' and 'Accountant'/'accountant'
      if (allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
        return next();
      }
    }
    return res.status(403).json({ message: "Access denied. Unauthorized role restriction." });
  };
};

// =====================================
// DASHBOARD STATS (Allowed for Admin & Accountant)
// =====================================
router.get("/stats", verifyToken, allowRoles("admin", "accountant"), async (req, res) => {
  try {
    const loans = await Loan.find();
    const customerCount = await User.countDocuments({ role: "user" });

    const totalDisbursed = loans.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    let totalRecovered = 0;

    loans.forEach((loan) => {
      loan.repaymentHistory?.forEach((pay) => {
        if (pay.status === "Approved" || pay.status === "Success") {
          totalRecovered += pay.amount || 0;
        }
      });
    });

    res.json({ totalDisbursed, totalRecovered, customerCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================
// PAYMENT VERIFICATION (Allowed for Admin & Accountant)
// =====================================
router.get("/pending-payments", verifyToken, allowRoles("admin", "accountant"), async (req, res) => {
  try {
    const payments = await Payment.find({ status: "Pending" }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/approve-payment/:id", verifyToken, allowRoles("admin", "accountant"), loanController.approvePayment);
router.delete("/reject-payment/:id", verifyToken, allowRoles("admin", "accountant"), loanController.rejectPayment);

// =====================================
// CUSTOMER MANAGEMENT (Allowed for Admin & Accountant)
// =====================================
router.get("/all-customers", verifyToken, allowRoles("admin", "accountant"), async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================
// STAFF MANAGEMENT (Allowed for Admin & Accountant)
// =====================================
router.get("/all-staff", verifyToken, allowRoles("admin", "accountant"), async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: "user" } }).select("-password").sort({ role: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================
// LOAN MANAGEMENT (Allowed for Admin & Accountant)
// =====================================
router.get("/all-loans", verifyToken, allowRoles("admin", "accountant"), async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================
// DAILY COLLECTION REPORT (Allowed for Admin & Accountant)
// =====================================
router.get("/collection-report", verifyToken, allowRoles("admin", "accountant"), async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const loans = await Loan.find();
    let report = [];

    loans.forEach((loan) => {
      loan.repaymentHistory?.forEach((pay) => {
        const payDate = new Date(pay.date || pay.paymentDate).setHours(0, 0, 0, 0);
        if (payDate === today && (pay.status === "Approved" || pay.status === "Success")) {
          report.push({
            loanId: loan.loanId,
            customerName: loan.customerName,
            amount: pay.amount,
            utr: pay.utr,
            date: pay.date || pay.paymentDate
          });
        }
      });
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================
// USER DELETE (🛡️ Strictly Locked to Admin Only)
// =====================================
router.delete("/users/:id", verifyToken, allowRoles("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User removed successfully from cluster infrastructure." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;