const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');

// --- 🛠️ CASHFREE CONFIGURATION ---
Cashfree.XClientId = "12575675075b22f889264cda78b7657521";
Cashfree.XClientSecret = "cfsk_ma_prod_8e3ff1ae55940c09c2e4944c0d0ba0c6_13b34662";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// 1. CREATE ORDER (For Custom Portal Integration)
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

// 2. VERIFY & AUTO-SETTLE (Manual Redirect Verification)
exports.verifyAndSavePayment = async (req, res) => {
    try {
        const { order_id } = req.body;
        const response = await Cashfree.PGFetchOrder("2023-08-01", order_id);
        const orderData = response.data;

        if (orderData.order_status === "PAID") {
            // Extract LoanId if it follows our ORD_..._LOANID pattern
            let loanId = null;
            if (order_id.includes('_')) {
                const parts = order_id.split('_');
                loanId = parts[parts.length - 1];
            }

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

// 3. 🔥 WEBHOOK HANDLING (Automated Settlement)
exports.handleWebhook = async (req, res) => {
    console.log("📩 Webhook Received from Cashfree...");
    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        const rawBody = JSON.stringify(req.body);

        // --- 🛡️ SECURITY: Signature Verification ---
        const secretKey = Cashfree.XClientSecret;
        const signedPayload = timestamp + rawBody;
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(signedPayload)
            .digest('base64');

        if (signature !== expectedSignature) {
            console.error("❌ Invalid Webhook Signature!");
            return res.status(401).send("Unauthorized");
        }

        const { data } = req.body;
        const orderId = data.order.order_id;
        const status = data.payment.payment_status;

        if (status === "SUCCESS") {
            let loanId = null;
            
            // Try to get Loan ID from order_id (ORD_..._loanId)
            if (orderId.startsWith('ORD_')) {
                const parts = orderId.split('_');
                loanId = parts[parts.length - 1];
            }

            // Settlement call
            await settleEMIPayment({
                order_amount: data.order.order_amount,
                cf_payment_id: data.payment.cf_payment_id,
                order_id: orderId,
                customer_id: data.customer_details.customer_id // Pass customer ID as backup
            }, loanId);
        }
        res.status(200).send("OK");
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).send("Internal Error");
    }
};

// --- ⚙️ HELPER FUNCTION: Ledger Adjustment Logic ---
async function settleEMIPayment(orderData, loanId) {
    const transactionId = orderData.cf_payment_id || orderData.order_id;
    
    // 1. Check for duplicates
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
        console.log("⚠️ Payment already processed:", transactionId);
        return { success: true, message: "Already Processed" };
    }

    // 2. Find Loan (Either by loanId or customerId)
    let loan;
    if (loanId) {
        loan = await Loan.findOne({ loanId });
    } else {
        // Backup: Find active loan for this customer (Useful for Payment Forms)
        loan = await Loan.findOne({ customerId: orderData.customer_id, status: 'Active' });
    }

    if (!loan) {
        console.error("❌ Loan not found for ID:", loanId || orderData.customer_id);
        return { success: false, message: "Loan not found" };
    }

    // 3. Record Payment
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
        $set: { 
            nextEmiDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
            status: 'Active' 
        },
        $inc: { 
            totalPaid: orderData.order_amount, 
            paidInstallments: 1,
            totalPending: -orderData.order_amount 
        }
      }
    );

    console.log(`✅ EMI Settled: Loan ${loan.loanId}, Amount ₹${orderData.order_amount}`);
    return { success: true, message: "Ledger Adjusted Successfully" };
}