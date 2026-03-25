const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// Razorpay Instance (Apni Keys .env se uthayega)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order (Jab user 'Pay' button dabaye)
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Number(amount) * 100, // Rupee to Paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: options.amount });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ error: "Could not create Razorpay order" });
  }
};

// 2. Verify & Save (Jab payment successfully ho jaye)
exports.verifyAndSavePayment = async (req, res) => {
  try {
    const { loanId, customerId, customerName, amount, razorpay_payment_id } = req.body;

    // Atlas mein payment record save karna
    const newPayment = new Payment({
      loanId,
      customerId,
      customerName,
      amount,
      transactionId: razorpay_payment_id, // Razorpay ki asli ID
      date: new Date(),
      status: "Success",
      type: "Weekly EMI"
    });

    await newPayment.save();

    // Loan ka 'Next EMI Date' 7 din aage badhana (Weekly Model)
    await Loan.findOneAndUpdate(
      { loanId: loanId },
      { $set: { nextEmiDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }
    );

    res.status(201).json({ message: "Payment Verified and Atlas Updated!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update payment in Atlas" });
  }
};