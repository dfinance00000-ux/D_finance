const { Cashfree } = require('cashfree-pg');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// --- 🛠️ CASHFREE CONFIGURATION ---
// Aapki CSV file se mili IDs yahan set kar di hain
Cashfree.XClientId = "12575675075b22f889264cda78b7657521";
Cashfree.XClientSecret = "cfsk_ma_prod_8e3ff1ae55940c09c2e4944c0d0ba0c6_13b34662";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION; // Aapki keys production ki hain

// 1. CREATE ORDER (Jab user payment initialize kare)
exports.createOrder = async (req, res) => {
  try {
    const { amount, customerId, customerName, customerPhone, loanId } = req.body;

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: `ORD_${Date.now()}_${loanId}`, // Unique Order ID
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: "support@d-finance.pro", // Required by Cashfree
        customer_phone: customerPhone || "9999999999",
      },
      order_meta: {
        // Payment ke baad redirect kahan hoga (Aapka Hostinger domain)
        return_url: `https://your-hostinger-domain.com/customer/tracking?order_id={order_id}`,
      },
      order_note: `EMI Repayment for Loan: ${loanId}`
    };

    // Cashfree Order Create API (v3)
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    
    // Frontend ko 'payment_session_id' chahiye hota hai modal kholne ke liye
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Cashfree Order Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Could not initialize Cashfree order" });
  }
};

// 2. VERIFY & SAVE (Jab payment complete ho jaye)
exports.verifyAndSavePayment = async (req, res) => {
  try {
    const { order_id, loanId } = req.body;

    // Cashfree se order ka current status fetch karein
    const response = await Cashfree.PGFetchOrder("2023-08-01", order_id);
    const orderData = response.data;

    if (orderData.order_status === "PAID") {
      // 1. Payment model mein record save karein
      const newPayment = new Payment({
        loanId: loanId,
        orderId: order_id,
        customerId: orderData.customer_details.customer_id,
        customerName: orderData.customer_details.customer_name,
        amount: orderData.order_amount,
        transactionId: order_id, // CF order id ko hi ref maan rahe hain
        date: new Date(),
        status: "Approved", // Seedha approve kyunki gateway se paisa aa gaya
        method: "Cashfree Online"
      });

      await newPayment.save();

      // 2. Loan Model Update Logic (Dynamic: Daily vs Weekly)
      const loan = await Loan.findOne({ loanId: loanId });
      
      if (loan) {
        let daysToAdd = (loan.emiType === 'Weekly EMI' || loan.type === 'Weekly EMI') ? 7 : 1;
        
        // Next EMI Date badhana aur total paid increment karna
        await Loan.findOneAndUpdate(
          { loanId: loanId },
          { 
            $set: { nextEmiDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000) },
            $inc: { totalPaid: orderData.order_amount, paidInstallments: 1 }
          }
        );
      }

      return res.status(200).json({ success: true, message: "Payment Verified & Ledger Updated!" });
    } else {
      return res.status(400).json({ success: false, message: "Payment not completed yet." });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ error: "Failed to verify payment with Cashfree" });
  }
};