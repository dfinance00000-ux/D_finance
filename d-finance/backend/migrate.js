require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI;

// --- 1. SCHEMAS DEFINE ---
const userSchema = new mongoose.Schema({
  fullName: String, email: { type: String, unique: true },
  password: { type: String, required: true }, mobile: String,
  role: String, sponsorId: String, cibilScore: Number, createdAt: Date
});

const loanSchema = new mongoose.Schema({
  loanId: String, customerId: String, sponsorId: String, customerName: String,
  amount: Number, type: String, status: String, appliedDate: Date,
  weeklyEMI: Number, totalWeeks: Number, religion: String, category: String
});

// Naya: Payments aur Branches ke liye Schema
const paymentSchema = new mongoose.Schema({
  loanId: String, customerName: String, amount: Number, 
  date: Date, status: String, type: String
});

const branchSchema = new mongoose.Schema({
  id: String, branchName: String, location: String
});

const User = mongoose.model('User', userSchema);
const Loan = mongoose.model('Loan', loanSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Branch = mongoose.model('Branch', branchSchema);

async function migrateData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Atlas connected. Starting full migration...");

    const rawData = fs.readFileSync('./db.json');
    const db = JSON.parse(rawData);

    // --- 1. MIGRATING USERS ---
    if (db.users) {
      await User.deleteMany({});
      await User.insertMany(db.users);
      console.log(`✅ ${db.users.length} Users moved.`);
    }

    // --- 2. MIGRATING LOANS ---
    if (db.loans) {
      await Loan.deleteMany({});
      const cleanedLoans = db.loans.map(loan => ({
        ...loan,
        loanId: loan.id, // ID mapping fix
        amount: Number(loan.amount),
        weeklyEMI: Number(loan.emiAmount || loan.weeklyEMI) || 0,
        totalWeeks: Number(loan.tenure || loan.totalWeeks) || 12
      }));
      await Loan.insertMany(cleanedLoans);
      console.log(`✅ ${db.loans.length} Loans moved.`);
    }

    // --- 3. MIGRATING PAYMENTS (Naya) ---
    if (db.payments) {
      await Payment.deleteMany({});
      await Payment.insertMany(db.payments);
      console.log(`✅ ${db.payments.length} Payment records moved.`);
    }

    // --- 4. MIGRATING BRANCHES (Naya) ---
    if (db.branches) {
      await Branch.deleteMany({});
      await Branch.insertMany(db.branches);
      console.log(`✅ ${db.branches.length} Branch data moved.`);
    }

    console.log("\n🚀 DATABASE MIGRATION 100% COMPLETE!");
    process.exit();
  } catch (err) {
    console.error("❌ Migration Failed:", err);
    process.exit(1);
  }
}

migrateData();