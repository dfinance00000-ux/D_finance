const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Loan = require("../models/Loan");
const Payment = require("../models/Payment");

// Middleware
const {
  verifyToken,
  isAdmin
} = require("../middlewares/authMiddleware");

// Controller
const loanController =
  require("../controllers/loanController");

// =====================================
// DASHBOARD STATS
// =====================================

router.get(
  "/stats",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {

      const loans =
        await Loan.find();

      const customerCount =
        await User.countDocuments({
          role: "user"
        });

      const totalDisbursed =
        loans.reduce(
          (acc, curr) =>
            acc +
            (curr.amount || 0),
          0
        );

      let totalRecovered = 0;

      loans.forEach((loan) => {

        loan.repaymentHistory?.forEach(
          (pay) => {

            if (
              pay.status ===
                "Approved" ||
              pay.status ===
                "Success"
            ) {

              totalRecovered +=
                pay.amount || 0;
            }
          }
        );
      });

      res.json({
        totalDisbursed,
        totalRecovered,
        customerCount
      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

// =====================================
// PAYMENT VERIFICATION
// =====================================

router.get(
  "/pending-payments",
  verifyToken,
  isAdmin,
  async (req, res) => {

    try {

      const payments =
        await Payment.find({
          status: "Pending"
        }).sort({
          createdAt: -1
        });

      res.json(payments);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

// IMPORTANT
// Ensure these functions exist in loanController.js

router.post(
  "/approve-payment/:id",
  verifyToken,
  isAdmin,
  loanController.approvePayment
);

router.delete(
  "/reject-payment/:id",
  verifyToken,
  isAdmin,
  loanController.rejectPayment
);

// =====================================
// CUSTOMER MANAGEMENT
// =====================================

router.get(
  "/all-customers",
  verifyToken,
  isAdmin,
  async (req, res) => {

    try {

      const customers =
        await User.find({
          role: "user"
        })
          .select("-password")
          .sort({
            createdAt: -1
          });

      res.json(customers);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

// =====================================
// STAFF MANAGEMENT
// =====================================

router.get(
  "/all-staff",
  verifyToken,
  isAdmin,
  async (req, res) => {

    try {

      const staff =
        await User.find({
          role: {
            $ne: "user"
          }
        })
          .select("-password")
          .sort({
            role: 1
          });

      res.json(staff);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

// =====================================
// LOAN MANAGEMENT
// =====================================

router.get(
  "/all-loans",
  verifyToken,
  isAdmin,
  async (req, res) => {

    try {

      const loans =
        await Loan.find().sort({
          createdAt: -1
        });

      res.json(loans);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

// =====================================
// DAILY COLLECTION REPORT
// =====================================

router.get(
  "/collection-report",
  verifyToken,
  isAdmin,
  async (req, res) => {

    try {

      const today =
        new Date().setHours(
          0,
          0,
          0,
          0
        );

      const loans =
        await Loan.find();

      let report = [];

      loans.forEach(
        (loan) => {

          loan.repaymentHistory?.forEach(
            (pay) => {

              const payDate =
                new Date(
                  pay.date ||
                    pay.paymentDate
                ).setHours(
                  0,
                  0,
                  0,
                  0
                );

              if (
                payDate === today &&
                (
                  pay.status ===
                    "Approved" ||
                  pay.status ===
                    "Success"
                )
              ) {

                report.push({
                  loanId:
                    loan.loanId,
                  customerName:
                    loan.customerName,
                  amount:
                    pay.amount,
                  utr:
                    pay.utr,
                  date:
                    pay.date ||
                    pay.paymentDate
                });
              }
            }
          );
        }
      );

      res.json(report);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

// =====================================
// USER DELETE
// =====================================

router.delete(
  "/users/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {

    try {

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "User removed successfully"
      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });
    }
  }
);

module.exports = router;