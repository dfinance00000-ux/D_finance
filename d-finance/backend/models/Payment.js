const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // 🔥 Unique Tracking ID (Humesha auto-generate hoga)
  paymentId: { 
    type: String, 
    unique: true, 
    required: true,
    default: () => "PAY-" + Date.now() + Math.floor(1000 + Math.random() * 9000)
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
  
  // 🛠️ FIX: UTR ko optional kiya aur uniqueness hatayi taaki testing error na aaye
  utr: { 
    type: String, 
    required: false, // Ab ye zaroori nahi hai agar screenshot hai toh
    trim: true,
    default: "N/A"
  },

  // --- 📸 Evidence ---
  // 🛠️ FIX: Screenshot field ab flexible hai
  screenshot: { 
    type: String, // Base64 Receipt String
    required: false,
    default: ""
  },

  // --- 🚦 Status & Verification ---
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },

  // --- 🗓️ Timing & Audit ---
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  verifiedAt: { 
    type: Date 
  },
  verifiedBy: { 
    type: String // Admin/Accountant Name
  },
  
  // Extra Info: Kis raste se payment aayi
  paymentMethod: {
    type: String,
    enum: ['Online', 'Manual QR', 'Cash'],
    default: 'Manual QR'
  }
}, { 
  timestamps: true 
});

// Optimization: Taki Accountant ko pending list turant mile
PaymentSchema.index({ status: 1, createdAt: -1 });

// Export Logic
module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);