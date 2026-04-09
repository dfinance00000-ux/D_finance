const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // 🔥 Har payment ka unique track rakhne ke liye
  paymentId: { 
    type: String, 
    unique: true, 
    required: true,
    default: () => "PAY-" + Math.floor(100000 + Math.random() * 900000) // Auto-generate if not provided
  },

  // --- 🔗 Linking ---
  loanId: { 
    type: String, 
    required: true,
    index: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  customerName: { 
    type: String 
  },

  // --- 💰 Transaction Details ---
  amount: { 
    type: Number, 
    required: true 
  },
  utr: { 
    type: String, 
    required: true, 
    unique: true, // Ek UTR do baar use nahi ho sakta
    trim: true 
  },

  // --- 🚦 Status & Verification ---
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },

  // --- 📸 Evidence ---
  screenshot: { 
    type: String // Base64 Receipt
  },

  // --- 🗓️ Timing ---
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  verifiedAt: { 
    type: Date 
  },
  verifiedBy: { 
    type: String // Admin Name
  }
}, { 
  timestamps: true 
});

// Purane indexes delete karne ke liye aur naye model ko export karne ke liye
module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);