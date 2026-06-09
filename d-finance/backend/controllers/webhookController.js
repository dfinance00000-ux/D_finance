const Loan =
  require("../models/Loan");

const Payment =
  require("../models/Payment");

exports.cashfreeWebhookReceiver =
  async (req, res) => {

    try {

      const payload =
        req.body;

      const data =
        payload?.data;

      if (
        !data ||
        !data.order ||
        !data.payment
      ) {
        return res
          .status(200)
          .send("OK");
      }

      const orderId =
        data.order.order_id;

      const orderStatus =
        data.order.order_status;

      const amountPaid =
        Number(
          data.order.order_amount
        );

      const cfPaymentId =
        data.payment
          .cf_payment_id;

      const payment =
        await Payment.findOne({
          orderId
        });

      if (!payment) {
        console.log(
          "Payment Record Missing"
        );

        return res
          .status(200)
          .send("OK");
      }

      if (
        payment.status ===
        "Approved"
      ) {
        return res
          .status(200)
          .send("OK");
      }

      payment.cfPaymentId =
        cfPaymentId;

      payment.transactionId =
        cfPaymentId;

      payment.utr =
        cfPaymentId;

      payment.webhookPayload =
        payload;

      if (
        orderStatus ===
        "PAID"
      ) {

        payment.status =
          "Approved";

        payment.verifiedAt =
          new Date();

        payment.verifiedBy =
          "CASHFREE_GATEWAY";

        const loan =
          await Loan.findOne({
            loanId:
              payment.loanId
          });

        if (loan) {

          const previousPending =
            Number(
              loan.totalPending ||
              0
            );

          const previousPaid =
            Number(
              loan.totalPaid ||
              0
            );

          loan.totalPending =
            Math.max(
              0,
              previousPending -
              amountPaid
            );

          loan.totalPaid =
            previousPaid +
            amountPaid;

          loan.paidInstallments =
            Number(
              loan.paidInstallments ||
              0
            ) + 1;

          if (
            loan.totalPending <=
            0
          ) {
            loan.status =
              "Closed";
          }

          await loan.save();
        }

      } else {

        payment.status =
          "Failed";
      }

      await payment.save();

      return res
        .status(200)
        .send("OK");

    } catch (err) {

      console.error(
        "Webhook Error:",
        err
      );

      return res
        .status(500)
        .send("Error");
    }
  };