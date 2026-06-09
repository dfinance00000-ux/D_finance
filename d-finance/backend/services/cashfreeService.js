const Cashfree = require("../config/cashfree");

const createOrder = async (payload) => {
  return await Cashfree.PGCreateOrder("2025-01-01", payload);
};

module.exports = {
  createOrder,
};