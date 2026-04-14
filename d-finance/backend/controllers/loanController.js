// controllers/loanController.js
exports.updateLoanVerification = async (req, res) => {
  try {
    const loanId = req.params.id;
    const updateData = req.body; // Isme wo saari fields aayengi jo humne React se bheji hain

    const updatedLoan = await Loan.findByIdAndUpdate(
      loanId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedLoan) return res.status(404).json({ error: "Loan not found" });

    res.status(200).json(updatedLoan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};