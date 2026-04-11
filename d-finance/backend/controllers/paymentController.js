const { Cashfree } = require('cashfree-pg');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// --- 🛠️ CASHFREE CONFIGURATION ---
Cashfree.XClientId = "12575675075b22f889264cda78b7657521";
Cashfree.XClientSecret = "cfsk_ma_prod_8e3ff1ae55940c09c2e4944c0d0ba0c6_13b34662";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// 1. CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { amount, customerId, customerName, customerPhone, loanId } = req.body;

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: `ORD_${Date.now()}_${loanId}`, // 👈 LoanId order_id mein embed kar di hai
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: "support@d-finance.pro",
        customer_phone: customerPhone || "9999999999",
      },
      order_meta: {
        return_url: `https://your-hostinger-domain.com/customer/tracking?order_id={order_id}`,
      },
      order_note: `EMI Repayment for Loan: ${loanId}`
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Cashfree Order Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Could not initialize Cashfree order" });
  }
};

// 2. VERIFY & AUTO-SETTLE (Frontend Redirect ke baad)
exports.verifyAndSavePayment = async (req, res) => {
  try {
    const { order_id } = req.body;
    const response = await Cashfree.PGFetchOrder("2023-08-01", order_id);
    const orderData = response.data;

    if (orderData.order_status === "PAID") {
        // Order ID se asli Loan ID nikalna (ORD_timestamp_loanId)
        const parts = order_id.split('_');
        const loanId = parts[parts.length - 1];

        // Is function ko reuse kar rahe hain settlement ke liye
        const result = await settleEMIPayment(orderData, loanId);
        return res.status(200).json(result);
    } else {
      return res.status(400).json({ success: false, message: "Payment not completed yet." });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

// 3. 🔥 WEBHOOK HANDLING (Background Auto-Approval)
exports.handleWebhook = async (req, res) => {
    try {
        // Cashfree webhook structure ke hisab se data extract karein
        const { data } = req.body;
        const orderId = data.order.order_id;
        const status = data.payment.payment_status;

        if (status === "SUCCESS") {
            const parts = orderId.split('_');
            const loanId = parts[parts.length - 1];
            
            await settleEMIPayment({
                order_amount: data.order.order_amount,
                cf_payment_id: data.payment.cf_payment_id,
                customer_details: data.customer_details
            }, loanId);
        }
        res.status(200).send("Webhook Processed");
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).send("Internal Error");
    }
};

// --- ⚙️ HELPER FUNCTION: Ledger Adjustment & Approval Logic ---
async function settleEMIPayment(orderData, loanId) {
    // 1. Check if payment already recorded (Duplicate prevention)
    const existingPayment = await Payment.findOne({ transactionId: orderData.cf_payment_id || orderData.order_id });
    if (existingPayment) return { success: true, message: "Already Processed" };

    const loan = await Loan.findOne({ loanId });
    if (!loan) return { success: false, message: "Loan not found" };

    // 2. Save Payment Record
    const newPayment = new Payment({
      loanId: loanId,
      customerId: loan.customerId,
      customerName: loan.customerName,
      amount: orderData.order_amount,
      transactionId: orderData.cf_payment_id || orderData.order_id,
      date: new Date(),
      status: "Approved", 
      method: "Cashfree Online"
    });
    await newPayment.save();

    // 3. Update Loan Ledger (Settle amount & update next date)
    let daysToAdd = (loan.emiType === 'Weekly EMI' || loan.type === 'Weekly EMI') ? 7 : 1;
    
    await Loan.findOneAndUpdate(
      { loanId: loanId },
      { 
        $set: { 
            nextEmiDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
            status: 'Active' // Ensure status is approved/active
        },
        $inc: { 
            totalPaid: orderData.order_amount, 
            paidInstallments: 1,
            totalPending: -orderData.order_amount // 👈 Paisa adjust ho gaya!
        }
      }
    );

    return { success: true, message: "Ledger Adjusted Successfully" };
}