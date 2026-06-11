const axios = require("axios");
const Payment = require("../models/Payment"); // 🔥 Schema Path Reference[cite: 2]
const Loan = require("../models/Loan");       // 🔥 Schema Path Reference
const { createOrder } = require("../services/cashfreeService");

// =========================================================================
// 1️⃣ CONTROLLER: CREATE EMI PAYMENT ORDER (Auto Database Injection)
// =========================================================================
exports.createEmiPaymentOrder = async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    
    // ⚡ STEP A: Frontend par cut-off dependency khatam karo, direct DB look-up lagao
    const loan = await Loan.findOne({ loanId }); //
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Active loan reference not found in core registry."
      });
    }

    // Live execution tracing ke liye ek unique transaction order id matrix
    const orderId = `CF_TEST_${loanId}_${Date.now()}`;

    // ⚡ STEP B: Cashfree sandbox phone compliance normalization
    const basePhone = loan.customerMobile || "9999999999"; // Direct Model Reference[cite: 1]
    const cleanPhone = basePhone.replace(/\D/g, "").slice(-10);

    // 2. Database mein explicit values map karke reference generate karo
    await Payment.create({
      loanId: loan.loanId,
      customerId: loan.customerId, // Schema linked ObjectId bind[cite: 1, 2]
      customerName: loan.customerName, // Real customer name validation[cite: 1, 2]
      amount: parseFloat(amount),
      orderId: orderId,
      status: "Pending",
      paymentMethod: "Cashfree",
      gateway: "Cashfree"
    });

    // 3. Cashfree API Payload Matrix taiyar karo (Dashboard Visibility Focus)
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: String(loan.customerId), //[cite: 1]
        customer_phone: cleanPhone,
        customer_name: loan.customerName || "Verified Client", // 🔥 Cashfree Dashboard me Client Name print karega[cite: 1]
        customer_email: "customer@dfinance.space" // Sandbox fallback link
      },
      // 🔥 Meta Parameters: Dashboard Transaction view me separate track filter karne ke liye
      order_tags: {
        "Loan_ID": String(loanId)
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'https://dfinance.space'}/customer/dashboard?order_id={order_id}`
      }
    };

    // 4. Cashfree Sandbox API call handshake trigger karo
    const response = await createOrder(orderRequest);

    if (response && response.data) {
      return res.status(200).json({
        success: true,
        orderId: orderId,
        payment_session_id: response.data.payment_session_id,
        cf_order_id: response.data.cf_order_id
      });
    }

    throw new Error("Empty response object payload received from gateway cluster.");

  } catch (error) {
    console.log("========== CASHFREE SANDBOX CRITICAL ERROR ==========");
    console.error("Message:", error.message);
    if (error.response?.data) {
      console.error("Gateway Payload Error:", error.response.data);
    }
    console.log("====================================================");

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Payment Gateway Handshake Failed"
    });
  }
};


// =========================================================================
// 2️⃣ CONTROLLER: WEBHOOK ENGINE (Atomic Ledger Mutations)
// =========================================================================
exports.handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log(`📥 CASHFREE WEBHOOK EVENT: [${type}]`);

    if (type === "ORDER_PAID") {
      const orderId = data.order.order_id;
      const cfPaymentId = String(data.payment.cf_payment_id);
      const transactionAmount = Number(data.order.order_amount);

      const payment = await Payment.findOne({ orderId }); //[cite: 2]

      if (!payment) {
        return res.status(200).send("Record reference missing");
      }

      // IDEMPOTENCY CHECK: Double transaction allocation guard mechanism
      if (payment.status === "Approved") {
        return res.status(200).send("Already processed and mutated.");
      }

      // Payment documentation status shift[cite: 2]
      payment.status = "Approved";
      payment.utr = cfPaymentId;
      payment.cfPaymentId = cfPaymentId;
      payment.verifiedAt = new Date();
      await payment.save();

      // Core Ledger Deductions pipeline execution (Atomic Shift)[cite: 1]
      await Loan.findOneAndUpdate(
        { loanId: payment.loanId },
        {
          $inc: { totalPaid: transactionAmount, totalPending: -transactionAmount }, //[cite: 1]
          $push: {
            repaymentHistory: {
              amount: transactionAmount,
              utr: cfPaymentId,
              status: "Approved",
              date: new Date() //[cite: 1]
            }
          }
        }
      );
      console.log(`✅ Webhook Ledger: Balance Deducted successfully for Order ${orderId}`);
    }
    return res.status(200).send("OK");
  } catch (err) {
    console.error("🚨 Webhook Engine Mutation Crash:", err.message);
    return res.status(500).send("Internal Error Interruption");
  }
};


// =========================================================================
// 3️⃣ CONTROLLER: GET PAYMENT STATUS (Automated Self-Healing Sync Engine)
// =========================================================================
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ orderId }); //[cite: 2]
    if (!payment) {
      return res.status(404).json({ success: false, message: "Transaction file record missing" });
    }

    // Anti-Loop Block: Agar pehle hi webhook se process ho chuka hai, skip server processing
    if (payment.status === "Approved") {
      return res.json({ success: true, status: "Approved", amount: payment.amount });
    }

    // Live Gateway status verification network call sequence
    const isProd = process.env.CASHFREE_APP_ID && !process.env.CASHFREE_APP_ID.startsWith("TEST");
    const baseURL = isProd 
      ? `https://api.cashfree.com/pg/orders/${orderId}` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const cfResponse = await axios.get(baseURL, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    });

    // Gateway integrity state verify handler
    if (cfResponse.data?.order_status === "PAID") {
      payment.status = "Approved";
      payment.utr = String(cfResponse.data.cf_order_id || orderId);
      payment.cfOrderId = String(cfResponse.data.cf_order_id);
      payment.verifiedAt = new Date();
      await payment.save();

      // Double structural balancing pipeline trigger for pending states execution[cite: 1]
      await Loan.findOneAndUpdate(
        { loanId: payment.loanId },
        {
          $inc: { totalPaid: payment.amount, totalPending: -payment.amount }, //[cite: 1]
          $push: {
            repaymentHistory: {
              amount: payment.amount,
              utr: payment.utr,
              status: "Approved",
              date: new Date() //[cite: 1]
            }
          }
        }
      );
      console.log(`✅ Sync Engine Ledger: Self-Healed & Balance Deducted for Order ${orderId}`);
      return res.json({ success: true, status: "Approved", amount: payment.amount });
    }

    return res.json({ success: true, status: payment.status, amount: payment.amount });

  } catch (err) {
    console.error("🚨 Sync Engine Status Integrity Failure:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};