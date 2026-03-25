const Voucher = require('../models/Voucher');

exports.generateAutoVoucher = async (data) => {
  const { amount, type, customerId, branchId, remarks } = data;
  
  const lastVoucher = await Voucher.findOne().sort({ createdAt: -1 });
  const nextNo = lastVoucher ? parseInt(lastVoucher.voucherNo) + 1 : 10001;

  const newVoucher = new Voucher({
    voucherNo: nextNo,
    amount,
    type, // DR/CR
    customerId,
    branchId,
    remarks,
    date: new Date(),
    status: 'Generated'
  });

  return await newVoucher.save();
};