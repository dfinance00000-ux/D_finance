const Payment = require("../models/Payment");
const { createOrder } = require("../services/cashfreeService");

exports.createPaymentSession =
  async (req, res) => {

    try {

      const {
        loanId,
        amount,
        customer_id,
        customer_phone
      } = req.body;

      const orderId =
        `CF_EMI_${loanId}_${Date.now()}`;

      const payment =
        await Payment.create({
          loanId,
          customerId: customer_id,
          amount,
          orderId,
          status: "Pending",
          paymentMethod: "Cashfree"
        });

      const orderRequest = {
        order_id: orderId,

        order_amount: amount,

        order_currency: "INR",

        customer_details: {
          customer_id:
            String(customer_id),
          customer_phone:
            customer_phone
        },

        order_meta: {
          return_url:
            `${process.env.FRONTEND_URL}/payment-success?order_id={order_id}`
        }
      };

      const response =
        await createOrder(
          orderRequest
        );

      payment.cfOrderId =
        response.data.cf_order_id;

      await payment.save();

      res.status(200).json({
        success: true,
        orderId,
        ...response.data
      });

    } catch (error) {

      console.error(
        "Cashfree Error:",
        error.response?.data ||
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Payment Session Creation Failed"
      });
    }
  };

exports.getPaymentStatus =
  async (req, res) => {

    try {

      const payment =
        await Payment.findOne({
          orderId:
            req.params.orderId
        });

      if (!payment) {
        return res.status(404).json({
          success: false
        });
      }

      res.json({
        success: true,
        status:
          payment.status,
        amount:
          payment.amount,
        paymentId:
          payment.paymentId
      });

    } catch (err) {

      res.status(500).json({
        success: false
      });
    }
  };