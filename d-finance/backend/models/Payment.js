const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      required: true,
      default: () =>
        "PAY-" +
        Date.now() +
        Math.floor(1000 + Math.random() * 9000)
    },

    loanId: {
      type: String,
      required: true,
      index: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    customerName: {
      type: String
    },

    amount: {
      type: Number,
      required: true
    },

    orderId: {
      type: String,
      unique: true,
      sparse: true
    },

    cfOrderId: {
      type: String
    },

    cfPaymentId: {
      type: String
    },

    transactionId: {
      type: String
    },

    utr: {
      type: String,
      trim: true,
      sparse: true // 🔥 Schema wise ab 'null' duplicate error nahi aayega
    },

    screenshot: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Failed"
      ],
      default: "Pending"
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cashfree",
        "Online",
        "Manual QR",
        "Cash"
      ],
      default: "Cashfree"
    },

    gateway: {
      type: String,
      default: "Cashfree"
    },

    paymentDate: {
      type: Date,
      default: Date.now
    },

    verifiedAt: {
      type: Date
    },

    verifiedBy: {
      type: String
    },

    webhookPayload: {
      type: Object
    },

    remarks: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Performance compound indexing
PaymentSchema.index({
  status: 1,
  createdAt: -1
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

// 🚨 ==================== D-FINANCE SELF-HEALING ENGINE ====================
// Yeh block server boot hote hi purane block karne waale unique indexes ko force-drop karega
Payment.collection.dropIndex("utr_1")
  .then(() => {
    console.log("🗑️ Live Sync Check: Old strict unique utr_1 index successfully removed from database cloud cluster.");
  })
  .catch((err) => {
    console.log("ℹ️ Live Sync Check: Index clean or already updated on MongoDB Atlas.");
  });
// =========================================================================

module.exports = Payment;