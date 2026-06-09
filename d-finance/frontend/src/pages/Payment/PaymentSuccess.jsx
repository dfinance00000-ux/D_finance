import React, {
  useEffect,
  useState
} from "react";

import {
  useSearchParams,
  useNavigate
} from "react-router-dom";

import API from "../../api/axios";

export default function PaymentSuccess() {

  const navigate =
    useNavigate();

  const [params] =
    useSearchParams();

  const [status, setStatus] =
    useState("Checking");

  useEffect(() => {

    const orderId =
      params.get("order_id");

    if (!orderId) {
      setStatus("Failed");
      return;
    }

    const checkPayment =
      async () => {

        try {

          const { data } =
            await API.get(
              `/payments/status/${orderId}`
            );

          if (
            data.status ===
            "Approved"
          ) {

            setStatus(
              "Success"
            );

            setTimeout(() => {

              navigate(
                "/customer/payments"
              );

            }, 3000);

          } else if (
            data.status ===
            "Failed"
          ) {

            setStatus(
              "Failed"
            );

          } else {

            setStatus(
              "Pending"
            );
          }

        } catch (err) {

          console.error(err);

          setStatus(
            "Failed"
          );
        }
      };

    checkPayment();

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-8 rounded-3xl shadow-xl text-center">

        {status ===
          "Checking" && (
          <>
            <h2 className="text-2xl font-bold">
              Verifying Payment...
            </h2>
          </>
        )}

        {status ===
          "Pending" && (
          <>
            <h2 className="text-2xl font-bold text-yellow-500">
              Payment Pending
            </h2>
          </>
        )}

        {status ===
          "Success" && (
          <>
            <h2 className="text-2xl font-bold text-green-600">
              Payment Successful
            </h2>

            <p className="mt-2">
              Redirecting...
            </p>
          </>
        )}

        {status ===
          "Failed" && (
          <>
            <h2 className="text-2xl font-bold text-red-600">
              Payment Failed
            </h2>
          </>
        )}

      </div>

    </div>
  );
}