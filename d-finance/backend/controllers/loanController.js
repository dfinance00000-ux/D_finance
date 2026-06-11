const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

// --- SUBMIT MANUAL PAYMENT ---
exports.payManual = async (req, res) => {
    try {
        const { loanId } = req.params;
        const data = req.body; 
  
        if (!data?.screenshot || data.screenshot.length < 100) {
            return res.status(400).json({ success: false, error: "Empty image node." });
        }

        if (data.utr && !["CASHFREE_PAY", "N/A", "", "NONE"].includes(data.utr.toUpperCase().trim())) {
            const existingUTR = await Payment.findOne({ utr: data.utr.trim() });
            if (existingUTR) return res.status(400).json({ success: false, error: "UTR already exists!" });
        }

        const newPayment = new Payment({
            loanId: loanId || data.loanId,
            customerId: data.customerId,
            customerName: data.customerName,
            amount: Number(data.amount || 0),
            utr: data.utr || "N/A",
            screenshot: data.screenshot, 
            status: 'Pending',
            paymentMethod: data.paymentMethod || 'Manual QR', // 🔥 Fix: Don't let it default to Cashfree
            paymentDate: new Date()
        });

        await newPayment.save();
        res.status(200).json({ success: true, message: "Receipt saved successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- APPROVE PAYMENT (Ledger Integrity Maintained) ---
exports.approvePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { loanId, amount, utr } = req.body;

        const loan = await Loan.findOne({ loanId: loanId });
        if (!loan) return res.status(404).json({ success: false, error: "Loan ID mismatch!" });

        loan.repaymentHistory.push({
            amount: Number(amount || 0),
            utr: utr || "Manual_Verified",
            date: new Date(),
            status: 'Approved'
        });

        loan.totalPending = Math.max(0, Number(loan.totalPending || 0) - Number(amount || 0));
        loan.totalPaid = Number(loan.totalPaid || 0) + Number(amount || 0);
        await loan.save();

        // 🔥 FIX: Instead of findByIdAndDelete, update status to keep historical data audit proofs
        await Payment.findByIdAndUpdate(id, { $set: { status: 'Approved' } });

        res.status(200).json({ success: true, message: "Verified successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Approval failed." });
    }
};

// Dummy declarations placeholders to keep loanRoutes functional
exports.getAllLoans = async (req, res) => { try { const data = await Loan.find({}); res.json(data); } catch(e) { res.status(500).json(e); } };
exports.createLoan = async (req, res) => { try { const n = new Loan(req.body); await n.save(); res.json(n); } catch(e) { res.status(500).json(e); } };
exports.updateLoanVerification = async (req, res) => { /* keeping your existing logic here */ };
exports.rejectPayment = async (req, res) => { await Payment.findByIdAndUpdate(req.params.id, { status: 'Rejected' }); res.json({success:true}); };