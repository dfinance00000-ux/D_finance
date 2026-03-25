require('dotenv').config(); 
const express = require('express');
const connectDB = require('./config/db'); 
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');

// Database Connect
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. RAZORPAY CONFIG ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

// --- 2. MONGODB MODELS ---
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobile: String,
  adhaar: String,      // Frontend Step 1 field
  pan: String,         // Frontend Step 1 field
  sponsorId: String,   // Frontend Step 2 field
  cibilScore: Number,  // Frontend Step 1 field
  role: { type: String, enum: ['Admin', 'User', 'Accountant', 'Customer'], default: 'Customer' },
  createdAt: { type: Date, default: Date.now }
}));

const Loan = mongoose.models.Loan || mongoose.model('Loan', new mongoose.Schema({
  loanId: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  amount: Number,
  weeklyEMI: Number,
  status: { type: String, default: 'Verification Pending' },
  nextEmiDate: Date,
  repaymentSchedule: Array
}));

// --- 3. MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) { res.status(401).json({ error: "Invalid Token" }); }
};

// --- 4. AUTH ROUTES ---

// Naya Route: Advisor Check (Frontend Step 2 ke liye)
app.get('/api/auth/check-advisor/:id', async (req, res) => {
  try {
    // Mathura Launch ke liye "ADMIN001" ko default valid sponsor maana hai
    const sponsorId = req.params.id;
    const advisor = await User.findOne({ sponsorId: sponsorId });
    
    if (sponsorId === "ADMIN001" || advisor) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ error: "Sponsor verification failed" });
  }
});

// Signup (Updated with new fields)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully!" });
  } catch (err) { 
    res.status(400).json({ error: "Signup Failed: " + err.message }); 
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, role: user.role, cibil: user.cibilScore } });
  } catch (err) { res.status(500).json({ error: "Login Error" }); }
});

// --- 5. LOAN & PAYMENT ROUTES ---

app.post('/api/loans/apply', verifyToken, async (req, res) => {
  try {
    const newLoan = new Loan({ ...req.body, customerId: req.user.id });
    await newLoan.save();
    res.status(201).json(newLoan);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- Get Loans for a specific customer ---
app.get('/api/loans', verifyToken, async (req, res) => {
  try {
    const { customerId } = req.query;
    // Security check: Customer sirf apna data dekh sake
    if (req.user.role === 'Customer' && req.user.id !== customerId) {
      return res.status(403).json({ error: "Unauthorized access to data" });
    }
    const loans = await Loan.find({ customerId }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch loans" });
  }
});

// --- Get Payments for a specific customer ---
app.get('/api/payments', verifyToken, async (req, res) => {
  try {
    const { customerId } = req.query;
    const payments = await Payment.find({ customerId }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});
// Razorpay Order
app.post('/api/payments/create-order', verifyToken, async (req, res) => {
  try {
    const options = {
      amount: Math.round(req.body.amount * 100), 
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: options.amount });
  } catch (err) { res.status(500).json({ error: "Razorpay Failed" }); }
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 D-Finance Engine Running on Port ${PORT}`);
  console.log(`📡 Advisor Check API: http://localhost:${PORT}/api/auth/check-advisor/ADMIN001`);
});