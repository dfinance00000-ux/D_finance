const Payment = require('../models/Payment'); // Payment model import check kar lena
const Loan = require('../models/Loan');

// --- CUSTOMER PAYMENT SUBMISSION ---
exports.payManual = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { 
            utr, 
            amount, 
            customerId, 
            customerName, 
            screenshot, // 🔥 Frontend se base64 image yahan aayegi
            paymentType 
        } = req.body;

        // 1. Check if UTR already exists (Duplicate payment check)
        const existingPay = await Payment.findOne({ utr });
        if (existingPay && utr !== "CASHFREE_PAY") {
            return res.status(400).json({ 
                success: false, 
                error: "This UTR/Transaction ID has already been submitted!" 
            });
        }

        // 2. Create New Payment Record
        const newPayment = new Payment({
            paymentId: "PAY-" + Date.now(), // Unique ID logic
            loanId: loanId,
            customerId: customerId,
            customerName: customerName,
            amount: Number(amount),
            utr: utr,
            screenshot: screenshot, // 🔥 Is line se image save hogi DB mein
            status: 'Pending',
            paymentDate: new Date()
        });

        await newPayment.save();

        console.log(`✅ Receipt for ${amount} received from ${customerName} (Loan: ${loanId})`);

        res.status(200).json({ 
            success: true, 
            message: "Payment receipt submitted successfully! Admin will verify soon." 
        });

    } catch (err) {
        console.error("❌ Payment Error:", err);
        res.status(500).json({ 
            success: false, 
            error: "Failed to submit receipt", 
            details: err.message 
        });
    }
};const Payment = require('../models/Payment'); // Payment model import check kar lena
const Loan = require('../models/Loan');

// --- CUSTOMER PAYMENT SUBMISSION ---
exports.payManual = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { 
            utr, 
            amount, 
            customerId, 
            customerName, 
            screenshot, // 🔥 Frontend se base64 image yahan aayegi
            paymentType 
        } = req.body;

        // 1. Check if UTR already exists (Duplicate payment check)
        const existingPay = await Payment.findOne({ utr });
        if (existingPay && utr !== "CASHFREE_PAY") {
            return res.status(400).json({ 
                success: false, 
                error: "This UTR/Transaction ID has already been submitted!" 
            });
        }

        // 2. Create New Payment Record
        const newPayment = new Payment({
            paymentId: "PAY-" + Date.now(), // Unique ID logic
            loanId: loanId,
            customerId: customerId,
            customerName: customerName,
            amount: Number(amount),
            utr: utr,
            screenshot: screenshot, // 🔥 Is line se image save hogi DB mein
            status: 'Pending',
            paymentDate: new Date()
        });

        await newPayment.save();

        console.log(`✅ Receipt for ${amount} received from ${customerName} (Loan: ${loanId})`);

        res.status(200).json({ 
            success: true, 
            message: "Payment receipt submitted successfully! Admin will verify soon." 
        });

    } catch (err) {
        console.error("❌ Payment Error:", err);
        res.status(500).json({ 
            success: false, 
            error: "Failed to submit receipt", 
            details: err.message 
        });
    }
};