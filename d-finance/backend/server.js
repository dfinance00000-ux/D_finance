require('dotenv').config(); 
const express = require('express');
const connectDB = require('./config/db'); 
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const axios = require('axios');
const crypto = require('crypto');

// Models Import
const User = require('./models/User'); 
const Loan = require('./models/Loan'); 
const Payment = require('./models/Payment');

connectDB();
const app = express();

app.use(cors({ origin: "*", credentials: true })); 
app.use(express.json());

// --- 1. RAZORPAY CONFIG ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- 2. AUTH MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) { res.status(401).json({ error: "Invalid Token" }); }
};

// --- 3. ADMIN ANALYTICS & SEARCH ---

app.get('/api/admin/stats', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: "Unauthorized" });
  try {
    const totalLoans = await Loan.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalRecovery = await Payment.aggregate([{ $match: { status: 'Success' } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    const activeCustomers = await User.countDocuments({ role: 'Customer' });
    res.json({
      totalDisbursed: totalLoans[0]?.total || 0,
      totalRecovered: totalRecovery[0]?.total || 0,
      customerCount: activeCustomers
    });
  } catch (err) { res.status(500).json({ error: "Stats Fetch Failed" }); }
});

app.get('/api/admin/search', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: "Unauthorized" });
  const { q } = req.query;
  try {
    const customers = await User.find({
      role: 'Customer',
      $or: [{ fullName: { $regex: q, $options: 'i' } }, { mobile: { $regex: q, $options: 'i' } }]
    }).limit(5);
    const loans = await Loan.find({
      $or: [{ loanId: { $regex: q, $options: 'i' } }, { customerName: { $regex: q, $options: 'i' } }]
    }).limit(5);
    res.json({ customers, loans });
  } catch (err) { res.status(500).json({ error: "Search Failed" }); }
});

app.get('/api/admin/all-users', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: "Unauthorized" });
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) { res.status(500).json({ error: "Users Fetch Failed" }); }
});

app.get('/api/admin/collection-report', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: "Unauthorized" });
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyPayments = await Payment.find({ status: 'Success', paymentDate: { $gte: startOfDay } }).sort({ paymentDate: -1 });
    res.json(dailyPayments);
  } catch (err) { res.status(500).json({ error: "Collection Report Failed" }); }
});

// --- 4. DYNAMIC EMI PAYMENT ROUTES ---

app.post('/api/payments/create-emi-order', verifyToken, async (req, res) => {
  try {
    const { loanId } = req.body;
    const loan = await Loan.findOne({ loanId });
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    const options = {
      amount: Math.round(loan.emiAmount * 100), 
      currency: "INR",
      receipt: `rcpt_${loanId}_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: loan.emiAmount, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ error: "Order Failed" }); }
});

app.post('/api/payments/verify', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, loanId } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest("hex");

    if (razorpay_signature !== expectedSign) return res.status(400).json({ error: "Invalid Signature" });

    const loan = await Loan.findOne({ loanId });
    loan.totalPaid += loan.emiAmount;
    
    // Auto-Closure Logic
    if (loan.totalPaid >= loan.amount) {
        loan.status = 'Closed';
    }

    loan.repaymentHistory.push({ paymentId: razorpay_payment_id, orderId: razorpay_order_id, amount: loan.emiAmount });
    await loan.save();

    const newPayment = new Payment({
      receiptId: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
      loanId: loan.loanId, customerId: req.user.id, customerName: loan.customerName,
      amount: loan.emiAmount, razorpay_order_id, razorpay_payment_id, status: 'Success', method: 'Online'
    });
    await newPayment.save();

    res.json({ success: true, message: "Payment Recorded!", loanStatus: loan.status });
  } catch (err) { res.status(500).json({ error: "Verification Error" }); }
});

// --- 5. KYC & LOAN ROUTES ---

app.post('/api/kyc/aadhaar-otp', async (req, res) => {
  try {
    const { adhaarNumber } = req.body;
    const response = await axios.post('https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/request', 
      { "@entity": "AadhaarOTPRequest", "aadhaar_number": adhaarNumber },
      { headers: { 'x-api-key': process.env.SANDBOX_API_KEY, 'x-api-secret': process.env.SANDBOX_SECRET, 'x-api-version': '1.0' }}
    );
    res.json({ success: true, ref_id: response.data.data.reference_id });
  } catch (err) { res.status(500).json({ error: "KYC Service Down" }); }
});

app.post('/api/kyc/aadhaar-verify', async (req, res) => {
  try {
    const { otp, ref_id } = req.body;
    const response = await axios.post('https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify', 
      { "@entity": "AadhaarOTPVerify", "otp": otp, "reference_id": ref_id },
      { headers: { 'x-api-key': process.env.SANDBOX_API_KEY, 'x-api-secret': process.env.SANDBOX_SECRET, 'x-api-version': '1.0' }}
    );
    res.json({ success: true, customerData: response.data.data });
  } catch (err) { res.status(500).json({ error: "Verification Failed" }); }
});

app.get('/api/admin/all-loans', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: "Unauthorized" });
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) { res.status(500).json({ error: "Fetch Failed" }); }
});

app.put('/api/admin/approve-loan/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: "Unauthorized" });
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, { 
      status: 'Approved', approvedBy: req.user.id, approvalDate: new Date() 
    }, { new: true });
    res.json({ message: "Loan Approved!", loan });
  } catch (err) { res.status(500).json({ error: "Approval Error" }); }
});

// --- 6. AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ ...req.body, email: cleanEmail, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Success" });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid Login" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, role: user.role } });
  } catch (err) { res.status(500).json({ error: "Login Error" }); }
});

// server.js mein kahin bhi temporary daal do, ek baar chalne ke baad hata dena
const createAdmin = async () => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("admin123", salt);
    const admin = new User({
        fullName: "Aditya Admin",
        mobile: "9999999999", // Apna number dalo
        password: hashed,
        role: "Admin"
    });
    await admin.save();
    console.log("✅ Admin Created!");
};
// createAdmin(); // Is line ko uncomment karke ek baar server start karo
// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 D-Finance Engine Running on Port ${PORT}`));