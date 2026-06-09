const express = require("express");
const router = express.Router();

const {
  createPaymentSession,
  getPaymentStatus
} = require("../controllers/cashfreeController");

const {
  cashfreeWebhookReceiver
} = require("../controllers/webhookController");

router.post(
  "/create-order",
  createPaymentSession
);

router.get(
  "/status/:orderId",
  getPaymentStatus
);

router.post(
  "/webhook/cashfree",
  cashfreeWebhookReceiver
);

module.exports = router;