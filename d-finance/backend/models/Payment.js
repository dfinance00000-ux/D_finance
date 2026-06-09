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
      trim: true
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

PaymentSchema.index({
  status: 1,
  createdAt: -1
});

PaymentSchema.index({
  orderId: 1
});

module.exports =
  mongoose.models.Payment ||
  mongoose.model(
    "Payment",
    PaymentSchema
  );