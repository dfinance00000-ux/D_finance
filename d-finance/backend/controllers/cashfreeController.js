const Payment = require("../models/Payment");
const { createOrder } = require("../services/cashfreeService");

exports.createEmiPaymentOrder = async (req, res) => {
  try {
    const { loanId, amount, customer_id, customer_phone } = req.body;
    
    // Sandbox test tracing ke liye ek unique transaction order id
    const orderId = `CF_TEST_${loanId}_${Date.now()}`;

    // ⚡ SAFEGUARD: Cashfree sandbox phone parameters ke liye strict hai (strips country codes & spaces)
    const cleanPhone = customer_phone ? customer_phone.replace(/\D/g, "").slice(-10) : "9999999999";

    // 1. Database mein pending ledger reference generate karo
    await Payment.create({
      loanId,
      customerId: customer_id,
      amount,
      orderId,
      status: "Pending",
      paymentMethod: "Cashfree"
    });

    // 2. Cashfree API Payload Matrix taiyar karo
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: String(customer_id),
        customer_phone: cleanPhone,
        customer_email: "test_customer@dfinance.space" // Sandbox fallback email
      },
      order_meta: {
  // 🔥 FIX: payment-success hata kar seedha customer dashboard par redirect karo
  return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/dashboard?order_id={order_id}`
}
    };

    // 3. Cashfree Sandbox API call handshake trigger karo
    const response = await createOrder(orderRequest);

    // 4. Response check karo aur payment_session_id frontend ko hand over karo
    if (response && response.data) {
      return res.status(200).json({
        success: true,
        orderId: orderId,
        payment_session_id: response.data.payment_session_id, // 🔥 Frontend demands this
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

// Webhook aur Status checking fallbacks placeholders
exports.handleWebhook = async (req, res) => res.status(200).send("Handled");
exports.getPaymentStatus = async (req, res) => res.json({ success: true, status: "Pending" });