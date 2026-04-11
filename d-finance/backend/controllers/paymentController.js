const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// --- 🛠️ CASHFREE CONFIGURATION ---
Cashfree.XClientId = "12575675075b22f889264cda78b7657521";
Cashfree.XClientSecret = "cfsk_ma_prod_8e3ff1ae55940c09c2e4944c0d0ba0c6_13b34662";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// 1. CREATE ORDER (For In-App Buttons)
exports.createOrder = async (req, res) => {
    try {
        const { amount, customerId, customerName, customerPhone, loanId } = req.body;
        const request = {
            order_amount: amount,
            order_currency: "INR",
            order_id: `ORD_${Date.now()}_${loanId}`, // Tracking LoanId in OrderId
            customer_details: {
                customer_id: customerId,
                customer_name: customerName,
                customer_email: "support@d-finance.pro",
                customer_phone: customerPhone || "9999999999",
            },
            order_meta: {
                return_url: `https://d-finance.pro/customer/tracking?order_id={order_id}`,
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

// 2. VERIFY (Manual Verification)
exports.verifyAndSavePayment = async (req, res) => {
    try {
        const { order_id } = req.body;
        const response = await Cashfree.PGFetchOrder("2023-08-01", order_id);
        const orderData = response.data;

        if (orderData.order_status === "PAID") {
            let loanId = order_id.includes('_') ? order_id.split('_').pop() : null;
            const result = await settleEMIPayment(orderData, loanId);
            return res.status(200).json(result);
        }
        res.status(400).json({ success: false, message: "Payment not completed." });
    } catch (err) {
        res.status(500).json({ error: "Verification failed" });
    }
};

// 3. 🔥 WEBHOOK (Handle Forms, Links & Buttons)
exports.handleWebhook = async (req, res) => {
    console.log("📩 Webhook Triggered...");
    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        const rawBody = req.rawBody || JSON.stringify(req.body); // Use rawBody for security

        // 🛡️ SECURITY: Verify Signature
        const secretKey = Cashfree.XClientSecret;
        const signedPayload = timestamp + rawBody;
        const expectedSignature = crypto.createHmac('sha256', secretKey)
            .update(signedPayload).digest('base64');

        if (signature !== expectedSignature) {
            console.error("❌ Invalid Signature!");
            return res.status(401).send("Unauthorized");
        }

        const { data, type } = req.body;
        
        // Handle SUCCESS events for both Gateway and Payment Links
        if (type.includes("SUCCESS") || type === "PAYMENT_LINK_PAID") {
            const orderDetails = data.order || data.payment_link;
            const paymentDetails = data.payment;
            
            const orderId = orderDetails.order_id || orderDetails.link_id;
            const amount = orderDetails.order_amount || orderDetails.link_amount_paid;
            const customerId = data.customer_details.customer_id;

            // Try to find Loan ID from Order ID or Link Purpose
            let loanId = null;
            if (orderId && orderId.includes('_')) {
                loanId = orderId.split('_').pop();
            } else if (orderDetails.link_purpose) {
                loanId = orderDetails.link_purpose; // Agar link purpose mein Loan ID likha ho
            }

            await settleEMIPayment({
                order_amount: amount,
                cf_payment_id: paymentDetails.cf_payment_id,
                order_id: orderId,
                customer_id: customerId
            }, loanId);
        }
        res.status(200).send("OK");
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).send("Internal Error");
    }
};

// --- ⚙️ HELPER: The "Smart" Accountant ---
async function settleEMIPayment(orderData, loanId) {
    const transactionId = orderData.cf_payment_id || orderData.order_id;
    
    // 1. Duplicate Check
    const existing = await Payment.findOne({ transactionId });
    if (existing) return { success: true, message: "Already Processed" };

    // 2. 🔥 SMART LOAN FINDER
    // Strategy: Search by LoanId first, then by CustomerId (Backup for Forms)
    let loan = await Loan.findOne({ 
        $or: [
            { loanId: loanId }, 
            { customerId: orderData.customer_id, status: 'Active' }
        ] 
    });

    if (!loan) {
        console.error(`❌ Loan not found for ID: ${loanId} or Customer: ${orderData.customer_id}`);
        return { success: false, message: "Loan not found" };
    }

    // 3. Save Record
    const newPayment = new Payment({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.customerName,
      amount: orderData.order_amount,
      transactionId: transactionId,
      date: new Date(),
      status: "Approved", 
      method: "Cashfree Online"
    });
    await newPayment.save();

    // 4. Update Ledger
    let daysToAdd = (loan.emiType === 'Weekly EMI' || loan.type === 'Weekly EMI') ? 7 : 1;
    
    await Loan.findOneAndUpdate(
      { loanId: loan.loanId },
      { 
        $set: { nextEmiDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000) },
        $inc: { 
            totalPaid: orderData.order_amount, 
            paidInstallments: 1,
            totalPending: -orderData.order_amount 
        }
      }
    );

    console.log(`✅ EMI Adjusted: ${loan.customerName} - ₹${orderData.order_amount}`);
    return { success: true };
}