const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId =
  process.env.CASHFREE_APP_ID;

Cashfree.XClientSecret =
  process.env.CASHFREE_SECRET_KEY;

// Sandbox Testing
Cashfree.XEnvironment = "SANDBOX";

// Production ke liye
// Cashfree.XEnvironment = "PRODUCTION";

module.exports = Cashfree;