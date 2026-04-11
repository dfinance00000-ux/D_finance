const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// --- 🛠️ CASHFREE CONFIGURATION ---
Cashfree.XClientId = "12575675075b22f889264cda78b7657521";
Cashfree.XClientSecret = "cfsk_ma_prod_8e3ff1ae55940c09c2e4944c0d0ba0c6_13b34662";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// 1. CREATE ORDER (v3 SDK Compliant - Generates payment_session_id)
exports.createOrder = async (req, res) => {
    try {
        const { amount, customerId, customerName, customerPhone, loanId } = req.body;

        const request = {
            order_amount: amount,
            order_currency: "INR",
            order_id: `ORD_${Date.now()}_${loanId}`,
            customer_details: {
                customer_id: customerId,
                customer_name: customerName,
                customer_email: "support@d-finance.pro",
                customer_phone: customerPhone || "9999999999",
            },
            order_meta: {
                // Popup/Modal integration ke liye return_url optional hai par zaroori hai
                return_url: `https://d-finance.pro/customer/tracking?order_id={order_id}`,
            },
            order_note: `EMI Repayment for Loan: ${loanId}`
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        
        // Frontend ko session id aur order id dono milenge
        res.status(200).json(response.data);
    } catch (err) {
        console.error("Cashfree Order Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Could not initialize Cashfree order" });
    }
};

// 2. VERIFY (Direct API Verification)
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
        console.error("Verification Error:", err);
        res.status(500).json({ error: "Verification failed" });
    }
};

// 3. 🔥 WEBHOOK (Supports Forms, Links, and SDK)
exports.handleWebhook = async (req, res) => {
    console.log("📩 Webhook Received Type:", req.body.type);
    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        const rawBody = req.rawBody || JSON.stringify(req.body);

        // 🛡️ SECURITY: Verify Signature
        const secretKey = Cashfree.XClientSecret;
        const signedPayload = timestamp + rawBody;
        const expectedSignature = crypto.createHmac('sha256', secretKey)
            .update(signedPayload).digest('base64');

        if (signature !== expectedSignature) {
            console.error("❌ Invalid Webhook Signature!");
            return res.status(401).send("Unauthorized");
        }

        const { data, type } = req.body;

        // Logics for different webhook types
        if (type === "PAYMENT_FORM_ORDER_WEBHOOK" || type.includes("SUCCESS") || type === "PAYMENT_LINK_PAID") {
            
            const orderData = data.order || data.payment_link;
            const paymentData = data.payment || {};
            
            const status = orderData.order_status || paymentData.payment_status;

            if (status === "PAID" || status === "SUCCESS") {
                const amount = orderData.order_amount || orderData.link_amount_paid;
                const transactionId = paymentData.cf_payment_id || orderData.transaction_id || orderData.order_id;
                const orderId = orderData.order_id || orderData.link_id;

                // Customer Details for searching loan
                const customerPhone = data.customer_details?.customer_phone;
                const customerName = data.customer_details?.customer_name;
                const customerIdFromCashfree = data.customer_details?.customer_id;

                // 💡 SMART SEARCH: Match by OrderId logic, then Phone, then CustomerId
                let extractedLoanId = orderId.includes('_') ? orderId.split('_').pop() : (orderData.link_purpose || null);

                const loan = await Loan.findOne({ 
                    $or: [
                        { loanId: extractedLoanId },
                        { customerPhone: customerPhone },
                        { customerId: customerIdFromCashfree }
                    ],
                    status: 'Active' 
                });

                if (loan) {
                    await settleEMIPayment({
                        order_amount: amount,
                        cf_payment_id: transactionId,
                        order_id: orderId,
                        customer_id: loan.customerId
                    }, loan.loanId);
                } else {
                    console.error("❌ Loan not found for customer:", customerName || customerIdFromCashfree);
                }
            }
        }
        res.status(200).send("OK");
    } catch (err) {
        console.error("Webhook Error Processing:", err);
        res.status(500).send("Internal Error");
    }
};

// --- ⚙️ HELPER: The "Smart" Accountant ---
async function settleEMIPayment(orderData, loanId) {
    const transactionId = orderData.cf_payment_id || orderData.order_id;
    
    // 1. Duplicate Check
    const existing = await Payment.findOne({ transactionId });
    if (existing) {
        console.log("⚠️ Payment already processed:", transactionId);
        return { success: true };
    }

    // 2. Find Loan
    const loan = await Loan.findOne({ loanId });
    if (!loan) return { success: false, message: "Loan not found" };

    // 3. Save Payment Record
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

    console.log(`✅ Automated Settlement Done: ${loan.customerName} | Amount: ₹${orderData.order_amount}`);
    return { success: true };
}