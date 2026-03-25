const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  // Unique Loan ID (e.g., DF-102710)
  loanId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  
  // Customer Details
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  customerName: { type: String, required: true },
  
  // Advisor/Sponsor Details
  advisorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  advisorName: String,

  // --- Loan Amount & Dynamic EMI Details ---
  amount: { type: Number, required: true },
  tenure: { type: Number, default: 12 }, // Months or Weeks
  interestRate: { type: Number, default: 12 }, // Annual %
  
  // Iska use Razorpay order create karte waqt hoga
  emiAmount: { type: Number, required: true }, 
  
  // EMI Type: Monthly, Weekly, ya Daily (Fintech ke liye zaroori hai)
  emiFrequency: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Monthly'], 
    default: 'Monthly' 
  },

  // Loan Type
  type: { 
    type: String, 
    enum: ['Personal Loan', 'JLG Loan', 'Agriculture Loan', 'Business Loan'],
    default: 'Personal Loan'
  },

  // Status Workflow
  status: { 
    type: String, 
    enum: ['Verification Pending', 'Approved', 'Rejected', 'Disbursed', 'Closed'], 
    default: 'Verification Pending' 
  },

  // --- Repayment & Tracking (Dynamic Payment ke liye) ---
  nextEmiDate: Date,
  totalPaid: { type: Number, default: 0 },
  totalPending: { type: Number }, // Amount left to pay
  lateFee: { type: Number, default: 0 },
  
  // Har payment ka record rakhne ke liye array
  repaymentHistory: [
    {
      paymentId: String,    // Razorpay Payment ID
      orderId: String,      // Razorpay Order ID
      amount: Number,
      date: { type: Date, default: Date.now },
      status: { type: String, default: 'Success' }
    }
  ],

  // Field Inspection & QC
  inspectionDate: Date,
  accountantComments: String,
  verifiedByName: String,

  // Approval Details
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: Date,
  
  // Metadata
  appliedDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Middleware to calculate totalPending before saving
LoanSchema.pre('save', function(next) {
    if (this.amount && this.totalPaid) {
        this.totalPending = this.amount - this.totalPaid;
    }
    next();
});

module.exports = mongoose.models.Loan || mongoose.model('Loan', LoanSchema);