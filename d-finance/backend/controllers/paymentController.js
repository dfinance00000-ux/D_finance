const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// --- 🛠️ CASHFREE CONFIGURATION ---
Cashfree.XClientId = "12575675075b22f889264cda78b7657521";
Cashfree.XClientSecret = "cfsk_ma_prod_8e3ff1ae55940c09c2e4944c0d0ba0c6_13b34662";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// 1. CREATE ORDER
exports.createOrder = async (req, res) => {
    console.log("📩 Create Order Request Received for Loan:", req.body.loanId);
    try {
        const { amount, customerId, customerName, customerPhone, loanId } = req.body;

        if (!amount || !loanId) {
            return res.status(400).json({ error: "Amount and Loan ID are required" });
        }

        const request = {
            order_amount: parseFloat(amount).toFixed(2),
            order_currency: "INR",
            order_id: `ORD_${Date.now()}_${loanId}`,
            customer_details: {
                customer_id: String(customerId),
                customer_name: customerName || "Customer",
                customer_email: "support@dfinance.space",
                customer_phone: customerPhone || "9999999999",
            },
            order_meta: {
                return_url: `https://dfinance.space/customer/tracking?order_id={order_id}`,
            },
            order_note: `EMI Repayment for Loan: ${loanId}`
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.status(200).json(response.data);
    } catch (err) {
        console.error("❌ Cashfree API Error:", err.response?.data || err.message);
        res.status(500).json({ 
            error: "Failed to initialize order", 
            details: err.response?.data?.message || err.message 
        });
    }
};

// 2. VERIFY (Direct API Verification - Manual Refresh Backup)
exports.verifyAndSavePayment = async (req, res) => {
    try {
        const { order_id } = req.body;
        const response = await Cashfree.PGFetchOrder("2023-08-01", order_id);
        const orderData = response.data;

        if (orderData.order_status === "PAID") {
            let loanId = order_id.includes('_') ? order_id.split('_').pop() : null;
            // Transforming data to match helper expectations
            const result = await settleEMIPayment(orderData, loanId);
            return res.status(200).json(result);
        }
        res.status(400).json({ success: false, message: "Payment not completed." });
    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ error: "Verification failed" });
    }
};

// 3. 🔥 WEBHOOK (Automation Heart)
exports.handleWebhook = async (req, res) => {
    console.log("📩 Webhook Received on dfinance.space!");
    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        const rawBody = req.rawBody || JSON.stringify(req.body);

        const secretKey = Cashfree.XClientSecret;
        const signedPayload = timestamp + rawBody;
        const expectedSignature = crypto.createHmac('sha256', secretKey)
            .update(signedPayload).digest('base64');

        if (signature !== expectedSignature) {
            console.error("❌ Invalid Webhook Signature!");
            return res.status(401).send("Unauthorized");
        }

        const { data, type } = req.body;

        if (type.includes("SUCCESS") || type === "PAYMENT_FORM_ORDER_WEBHOOK" || type === "PAYMENT_LINK_PAID") {
            
            const orderData = data.order || data.payment_link || {};
            const paymentData = data.payment || {};
            const status = orderData.order_status || paymentData.payment_status;

            if (status === "PAID" || status === "SUCCESS") {
                const amount = orderData.order_amount || orderData.link_amount_paid || paymentData.payment_amount;
                const transactionId = paymentData.cf_payment_id || orderData.transaction_id || orderData.order_id;
                const orderId = orderData.order_id || orderData.link_id;

                let extractedLoanId = orderId.includes('_') ? orderId.split('_').pop() : (orderData.link_purpose || null);

                const loan = await Loan.findOne({ 
                    $or: [
                        { loanId: extractedLoanId },
                        { customerPhone: data.customer_details?.customer_phone },
                        { customerId: data.customer_details?.customer_id }
                    ],
                    status: 'Active' 
                });

                if (loan) {
                    // Helper expecting single object containing amount and id
                    await settleEMIPayment({
                        order_amount: amount,
                        cf_payment_id: transactionId,
                        order_id: orderId
                    }, loan.loanId);
                } else {
                    console.error("❌ Loan not found for customer info provided.");
                }
            }
        }
        res.status(200).send("OK");
    } catch (err) {
        console.error("Webhook Processing Error:", err);
        res.status(500).send("Internal Error");
    }
};

// --- ⚙️ HELPER: Ledger Adjustment Logic ---
async function settleEMIPayment(paymentInfo, loanId) {
    const transactionId = paymentInfo.cf_payment_id || paymentInfo.order_id;
    const amountPaid = paymentInfo.order_amount || paymentInfo.payment_amount;
    
    // 1. Duplicate Check
    const existing = await Payment.findOne({ transactionId });
    if (existing) {
        console.log("⚠️ Payment already processed:", transactionId);
        return { success: true };
    }

    // 2. Find Loan Record
    const loan = await Loan.findOne({ loanId });
    if (!loan) return { success: false, message: "Loan not found" };

    // 3. Save Payment Entry
    const newPayment = new Payment({
      loanId: loan.loanId,
      customerId: loan.customerId,
      customerName: loan.customerName,
      amount: amountPaid,
      transactionId: transactionId,
      date: new Date(),
      status: "Approved", 
      method: "Cashfree Online"
    });
    await newPayment.save();

    // 4. Update Loan Ledger
    let daysToAdd = (loan.emiType === 'Weekly EMI' || loan.type === 'Weekly EMI') ? 7 : 1;
    
    await Loan.findOneAndUpdate(
      { loanId: loan.loanId },
      { 
        $set: { nextEmiDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000) },
        $inc: { 
            totalPaid: amountPaid, 
            paidInstallments: 1,
            totalPending: -amountPaid 
        }
      }
    );

    console.log(`✅ Automated Settlement Done for ${loan.customerName}. ₹${amountPaid} Adjusted.`);
    return { success: true };
}