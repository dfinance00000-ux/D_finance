const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  // --- 🆔 Identification ---
  loanId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  customerName: { 
    type: String, 
    required: true 
  },
  
  // --- 🧑‍💼 Field Officer Logic ---
  // Mixed rakha hai taaki String ya ObjectId dono handle ho sakein
  fieldOfficerId: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  isAssigned: { 
    type: Boolean, 
    default: false 
  },

  // --- 💰 Amount Details ---
  amount: { type: Number, required: true }, 
  processingFee: { type: Number, default: 0 },
  fileCharge: { type: Number, default: 0 },
  netDisbursed: { type: Number }, 
  
  // --- 📈 Tenure & EMI Math ---
  tenureMonths: { type: Number, required: true }, 
  totalWeeks: { type: Number }, 
  weeklyEMI: { type: Number, required: true }, 
  totalPayable: { type: Number, required: true }, 
  
  // --- 📂 Categorization ---
  type: { 
    type: String, 
    enum: ['Personal Loan', 'JLG Loan', 'Agriculture Loan', 'Business Loan'],
    default: 'JLG Loan'
  },
  emiFrequency: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Monthly'], 
    default: 'Weekly' 
  },

  // --- 🚦 Status Workflow ---
  status: { 
    type: String, 
    enum: [
      'Hold - Pending Assignment', 
      'Pending Verification', 
      'Approved', 
      'Rejected', 
      'Disbursed', 
      'Closed'
    ], 
    default: 'Hold - Pending Assignment' 
  },

  // --- 💳 Repayment Tracking ---
  totalPaid: { type: Number, default: 0 },
  totalPending: { type: Number }, 
  nextEmiDate: Date,
  
  // repaymentHistory: [
  //   {
  //     paymentId: String, 
  //     orderId: String,   
  //     amount: Number,
  //     date: { type: Date, default: Date.now },
  //     status: { type: String, default: 'Success' }
  //   }
  // ],

  // models/Loan.js mein repaymentHistory array ko aise update karo
repaymentHistory: [
  {
    amount: Number,
    date: { type: Date, default: Date.now },
    utr: String,        // Transaction ID (User bharega)
    screenshot: String, // Screenshot ka URL
    status: { type: String, default: 'Pending' } // Admin approve karega
  }
],
  // --- 🗓️ Metadata ---
  appliedDate: { type: Date, default: Date.now }
}, { 
  timestamps: true // Automatically handles createdAt and updatedAt
});

module.exports = mongoose.models.Loan || mongoose.model('Loan', LoanSchema);