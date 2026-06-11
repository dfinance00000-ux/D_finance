const axios = require("axios");

const createOrder = async (payload) => {
  // 🔥 AUTODETECT ENVIRONMENT: Agar App ID 'TEST' se shuru ho raha hai toh Sandbox URL use hoga, nahi toh Production
  const isProd = process.env.CASHFREE_APP_ID && !process.env.CASHFREE_APP_ID.startsWith("TEST");
  const baseURL = isProd 
    ? "https://api.cashfree.com/pg/orders" 
    : "https://sandbox.cashfree.com/pg/orders";

  // Cashfree Standard REST Header Configuration
  const config = {
    headers: {
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      "x-api-version": "2023-08-01", // Stable production-grade API reference layer
      "Content-Type": "application/json",
    },
  };

  // Direct HTTP handshake request over Axios framework
  // Yeh exact response.data structure return karega jo cashfreeController expect kar raha hai
  return await axios.post(baseURL, payload, config);
};

module.exports = {
  createOrder,
};