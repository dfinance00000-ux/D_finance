const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // Unique Receipt Number (e.g., RCPT-992831)
  receiptId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  
  // Link to Loan & Customer
  loanId: { type: String, required: true }, // DF-102710
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  customerName: String,

  // Payment Details
  amount: { type: Number, required: true },
  paymentType: { 
    type: String, 
    enum: ['EMI', 'Late Fee', 'File Charge', 'Foreclosure'], 
    default: 'EMI' 
  },
  
  // Mode of Payment
  method: { 
    type: String, 
    enum: ['Online', 'Cash', 'UPI', 'Cheque'], 
    default: 'Online' 
  },

  // Razorpay Specific (Online ke liye)
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,

  // Collector Info (Agar cash collection ho toh)
  collectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  status: { 
    type: String, 
    enum: ['Success', 'Failed', 'Pending', 'Refunded'], 
    default: 'Pending' 
  },

  paymentDate: { type: Date, default: Date.now },
  remarks: String
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);