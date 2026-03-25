const mongoose = require('mongoose');

const FinancialYearSchema = new mongoose.Schema({
    yearName: { type: String, required: true }, // e.g. "2024-25"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isLocked: { type: Boolean, default: false }, // Prevent entries in old years
    isCurrent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('FinancialYear', FinancialYearSchema);