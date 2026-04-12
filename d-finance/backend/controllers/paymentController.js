// controllers/paymentController.js
const { Cashfree } = require('cashfree-pg');

// 🛡️ Pro-tip: Future mein in credentials ko .env file mein move kar dena
Cashfree.XClientId = "12575675075b22f889264cda78b7657521";
Cashfree.XClientSecret = "cfsk_ma_prod_8e3ff1ae55940c09c2e4944c0d0ba0c6_13b34662";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

/**
 * 💳 Create Order
 * Frontend se aane wali request ko Cashfree ke pass bhejta hai
 */
exports.createOrder = async (req, res) => {
    // Debugging ke liye log zaroori hai Render dashboard par
    console.log("📩 Request Data:", req.body);

    try {
        const { amount, customerId, customerName, customerPhone, loanId } = req.body;

        // 1. Double check missing fields
        if (!amount || !loanId || !customerId) {
            return res.status(400).json({ 
                message: "Validation Failed: amount, customerId, and loanId are required." 
            });
        }

        // 2. Format Request according to Cashfree PG v3
        const request = {
            order_amount: parseFloat(amount).toFixed(2), // Cashfree strictly needs 2 decimal places as string
            order_currency: "INR",
            order_id: `ORD_${Date.now()}_${loanId}`, // Unique ID with Loan Reference
            customer_details: {
                customer_id: String(customerId),
                customer_name: customerName || "Customer",
                customer_email: "support@dfinance.space", // Default support email
                customer_phone: customerPhone || "9999999999",
            },
            order_meta: {
                // Payment window close hone ke baad redirect destination
                return_url: `https://dfinance.space/dashboard`, 
            },
            order_note: `EMI Payment for Loan ID: ${loanId}`
        };

        // 3. Call Official Cashfree SDK
        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        
        console.log("✅ Cashfree Order Generated:", response.data.order_id);
        
        // 4. Send the session data to frontend
        res.status(200).json(response.data);

    } catch (err) {
        // Detailed error logging taaki humein pata chale API fail kyu hui
        const errorBody = err.response?.data || err.message;
        console.error("❌ Cashfree API Error Details:", errorBody);
        
        res.status(err.response?.status || 500).json({
            message: "Failed to create payment order",
            details: errorBody
        });
    }
};

/**
 * 🔍 Basic Verify (Optional: For manual refresh checks)
 */
exports.verifyAndSavePayment = async (req, res) => {
    try {
        const { order_id } = req.body;
        const response = await Cashfree.PGFetchOrder("2023-08-01", order_id);
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Verification failed" });
    }
};

// Webhook ka logic hum baad mein settle karenge jaise aapne kaha
exports.handleWebhook = async (req, res) => {
    console.log("📩 Webhook Received!");
    try {
        const { data, type } = req.body;

        // Check if payment is successful
        if (type === "PAYMENT_SUCCESS_WEBHOOK") {
            const orderData = data.order;
            const paymentData = data.payment;
            const customerData = data.customer_details;

            const amount = orderData.order_amount;
            const orderId = orderData.order_id;
            const transactionId = paymentData.cf_payment_id;
            const customerPhone = customerData.customer_phone;

            console.log(`Processing Payment: ₹${amount} for Phone: ${customerPhone}`);

            // --- 🔍 SMART SEARCH ---
            // Pehle Order ID se dhundo, agar nahi mile (Form case) toh Phone se dhundo
            let loan = await Loan.findOne({ 
                $or: [
                    { loanId: orderId.split('_').pop() }, // Custom Order ID logic
                    { customerPhone: customerPhone }      // Form Payment logic
                ],
                status: 'Active' 
            });

            if (loan) {
                // Yahan hum wahi settlement function call karenge jo pehle banaya tha
                await settleEMIPayment({
                    order_amount: amount,
                    cf_payment_id: transactionId,
                    order_id: orderId
                }, loan.loanId);
                
                console.log(`✅ Ledger Updated for ${loan.customerName}`);
            } else {
                console.error("❌ Webhook Error: No Active Loan found for this customer.");
            }
        }
        
        // Cashfree ko hamesha 200 OK bhejna zaroori hai
        res.status(200).send("OK");
    } catch (err) {
        console.error("Webhook Processing Error:", err);
        res.status(500).send("Internal Error");
    }
};