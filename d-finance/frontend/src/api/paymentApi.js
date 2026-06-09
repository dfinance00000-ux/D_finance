import axios from "./axios";

export const createOrder = async (data) => {
  const response = await axios.post(
    "/payments/create-order",
    data
  );

  return response.data;
};