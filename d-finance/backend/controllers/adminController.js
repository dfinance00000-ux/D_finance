const Payment = require('../models/Payment');

exports.rejectPayment = async (req, res) => {
    try {
        const { id } = req.params;

        // Payment dhoondo aur delete karo
        const deletedPayment = await Payment.findByIdAndDelete(id);

        if (!deletedPayment) {
            return res.status(404).json({ success: false, error: "Payment record not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Payment receipt rejected and deleted successfully." 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: "Server Error during rejection", 
            details: err.message 
        });
    }
};