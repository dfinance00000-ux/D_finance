const Loan = require('../models/Loan');

// Advisor jab verification submit karega
exports.verifyField = async (req, res) => {
  try {
    const { loanId, religion, category, houseType, monthlyIncome, observation } = req.body;

    const updatedLoan = await Loan.findOneAndUpdate(
      { loanId: loanId },
      { 
        status: 'Field Verified', // Status change taaki Accountant ko dikhe
        religion,
        category,
        houseType,
        monthlyIncome,
        accountantComments: observation, // Advisor ka comment
        inspectionDate: new Date()
      },
      { new: true }
    );

    res.status(200).json({ message: "Field Verification Successful!", data: updatedLoan });
  } catch (err) {
    res.status(500).json({ error: "Verification Failed", details: err.message });
  }
};