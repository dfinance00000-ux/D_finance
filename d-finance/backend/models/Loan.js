const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  // --- 🆔 Identification ---
  loanId: { 
    type: String, 
    unique: true, 
    required: [true, "Loan ID is required"] 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, "Customer ID is required"] 
  },
  customerName: { 
    type: String, 
    required: [true, "Customer Name is required"] 
  },
  
  // --- 🧑‍💼 Field Officer Logic ---
  fieldOfficerId: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  fieldOfficerName: { type: String },
  verifiedByName: { type: String }, 
  isAssigned: { 
    type: Boolean, 
    default: false 
  },

  // --- 💰 Amount Details ---
  amount: { type: Number, required: [true, "Amount is required"] }, 
  processingFee: { type: Number, default: 0 },
  fileCharge: { type: Number, default: 0 },
  netDisbursed: { type: Number }, 
  
  // --- 📈 Tenure & EMI Math ---
  tenureMonths: { type: Number, required: [true, "Tenure is required"] }, 
  totalWeeks: { type: Number }, 
  totalDays: { type: Number },
  weeklyEMI: { type: Number },
  dailyEMI: { type: Number },
  totalPayable: { type: Number, required: [true, "Total Payable amount is required"] }, 
  
  // --- 🏦 BANK DETAILS ---
  accountHolderName: { type: String },
  bankName: { type: String },
  branchName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  lastTransactionDate: { type: String },

  // --- 📸 KYC DOCUMENTS ---
  passbookPic: { type: String },
  aadhaarFront: { type: String },
  aadhaarBack: { type: String },
  secondaryIdFront: { type: String },
  secondaryIdBack: { type: String },
  nomineePic: { type: String },

  // --- 👤 NOMINEE DETAILS ---
  nomineeName: { type: String },
  nomineeRelation: { type: String },
  nomineeDOB: { type: String },
  nomineeMobile: { type: String },
  nomineeAddress: { type: String },
  nomineeGender: { type: String },

  // --- 🏠 FIELD AUDIT DETAILS ---
  religion: { type: String },
  category: { type: String },
  houseType: { type: String },
  monthlyIncome: { type: String },
  inspectionDate: { type: Date },

  // --- 📂 Categorization ---
  type: { 
    type: String, 
    enum: ['Personal Loan', 'JLG Loan', 'Agriculture Loan', 'Business Loan'],
    default: 'JLG Loan'
  },
  emiFrequency: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Monthly'], 
    default: 'Daily' 
  },

  // --- 🚦 Status Workflow ---
  status: { 
    type: String, 
    enum: [
      'Pending',                // 🔥 Added for general use
      'Hold - Pending Assignment', 
      'Pending Verification', 
      'Verification Pending', 
      'Field Verified', 
      'Approved', 
      'Disbursed', 
      'Rejected', 
      'Closed'
    ], 
    default: 'Pending Verification' 
  },

  // --- 💳 Repayment Tracking ---
  totalPaid: { type: Number, default: 0 },
  totalPending: { type: Number }, 
  nextEmiDate: Date,
  
  // 🔥 Internal History Tracking
  repaymentHistory: [
    {
      amount: Number,
      date: { type: Date, default: Date.now },
      utr: { type: String, trim: true },
      status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
      }
    }
  ],

  appliedDate: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

module.exports = mongoose.models.Loan || mongoose.model('Loan', LoanSchema);