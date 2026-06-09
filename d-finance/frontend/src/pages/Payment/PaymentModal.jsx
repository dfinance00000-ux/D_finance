import React, { useState } from "react";
import API from "../../api/axios";
import { load } from "@cashfreepayments/cashfree-js";
import {
  FiX,
  FiShield,
  FiLoader
} from "react-icons/fi";

const PaymentModal = ({
  loan,
  onClose
}) => {

  const [loading, setLoading] =
    useState(false);

  const handleCashfreePayment =
    async () => {

      setLoading(true);

      try {

        const { data } =
          await API.post(
            "/payments/create-order",
            {
              loanId:
                loan.loanId,

              amount:
                loan.installmentAmount,

              customer_id:
                loan.customerId?._id ||
                loan.customerId ||
                loan.loanId,

              customer_phone:
                loan.customerMobile ||
                "9999999999"
            }
          );

        if (
          !data?.payment_session_id
        ) {
          throw new Error(
            "Payment Session ID not received"
          );
        }

        const cashfree =
          await load({
            mode:
              import.meta.env.PROD
                ? "production"
                : "sandbox"
          });

        await cashfree.checkout({
          paymentSessionId:
            data.payment_session_id,
          redirectTarget:
            "_self"
        });

      } catch (err) {

        console.error(
          "Cashfree Error:",
          err.response?.data ||
            err
        );

        alert(
          err.response?.data
            ?.message ||
            err.message ||
            "Payment Failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl">

        <div className="flex justify-between items-center mb-6">

          <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1">
            <FiShield size={12} />
            D-FINANCE SECURE
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
          >
            <FiX />
          </button>

        </div>

        <div className="text-center mb-6">

          <p className="text-[9px] font-black text-slate-400 uppercase">
            Processing Payment
          </p>

          <h3 className="text-lg font-black">
            {loan.customerName}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Loan ID: {loan.loanId}
          </p>

          <h1 className="text-4xl font-black italic my-3 text-emerald-600">
            ₹{Number(
              loan.installmentAmount || 0
            ).toLocaleString()}
          </h1>

        </div>

        <button
          onClick={
            handleCashfreePayment
          }
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[12px] uppercase flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" />
              Processing...
            </>
          ) : (
            "Pay via Cashfree"
          )}
        </button>

      </div>

    </div>
  );
};

export default PaymentModal;