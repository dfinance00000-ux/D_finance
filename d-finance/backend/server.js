require('dotenv').config(); 
const express = require('express');
const connectDB = require('./config/db'); 
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Models Import
const User = require('./models/User'); 
const Loan = require('./models/Loan'); 

const app = express();

// --- 1. DATABASE & MIDDLEWARES ---
connectDB();
// --- server.js mein cors settings ---
// --- DATABASE & MIDDLEWARES KE BAAD ---

app.use(cors({
  origin: [
    "http://localhost:5173",                   // Local Testing ke liye
    "https://d-finance-izsi.vercel.app",       // Aapka Frontend (Vercel)
    "https://dfinance.space"                   // Aapka Custom Domain (agar hai)
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Ye hamesha CORS ke niche hona chahiye
app.use(express.json());

// --- EXTRA SAFETY FOR RENDER (Preflight fix) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Agar request allow list se hai toh header set karein
  if (origin && (origin.includes("localhost") || origin.includes("vercel.app") || origin.includes("onrender.com"))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
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

// --- 3. AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { mobile, password, role, fullName, email } = req.body;
        const userExists = await User.findOne({ mobile });
        if (userExists) return res.status(400).json({ error: "Mobile already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ 
            fullName, mobile, email: email?.toLowerCase().trim(), 
            password: hashedPassword, role: role || 'Customer', isVerified: false 
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registration successful" });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const user = await User.findOne({ mobile });
        if (!user) return res.status(401).json({ error: "Account not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id, role: user.role, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token, user: { id: user._id, fullName: user.fullName, role: user.role } });
    } catch (err) { res.status(500).json({ error: "Login Server Error" }); }
});

// --- 4. LOAN SYSTEM (CUSTOMER & FILTERS) ---

app.post('/api/loans/pay-manual/:loanId', verifyToken, async (req, res) => {
    try {
        const { utr, amount } = req.body;
        const loan = await Loan.findOne({ loanId: req.params.loanId });

        if (!loan) return res.status(404).json({ error: "Loan not found" });

        // Payment request ko history mein dalo as 'Pending'
        loan.repaymentHistory.push({
            amount: amount,
            utr: utr,
            date: new Date(),
            status: 'Pending'
        });

        await loan.save();
        res.json({ success: true, message: "Payment logged for verification" });
    } catch (err) {
        res.status(500).json({ error: "Payment logging failed" });
    }
});
app.post('/api/loans', verifyToken, async (req, res) => {
  try {
    const loanData = req.body;
    // Initial Status setting for Pool visibility
    const newLoan = new Loan({
        ...loanData,
        customerId: req.user.id,
        totalPending: loanData.totalPayable || 0,
        status: 'Hold - Pending Assignment', // Standard New Lead status
        isAssigned: false
    });
    await newLoan.save();
    res.status(201).json({ success: true, loan: newLoan });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/loans', verifyToken, async (req, res) => {
    try {
        const { status, sponsorId } = req.query;
        let query = {};
        if (sponsorId) query.fieldOfficerId = sponsorId;

        // Flexible Status Handling
        if (status) {
            if (status === "Verification Pending") {
                query.status = { $in: ["Verification Pending", "Pending Verification"] };
            } else {
                query.status = status;
            }
        }

        if (!status && !sponsorId) query.customerId = req.user.id;

        const loans = await Loan.find(query).sort({ createdAt: -1 });
        res.json(loans);
    } catch (err) { res.status(500).json({ error: "Fetch error" }); }
});

// --- 5. FIELD OFFICER / ADVISOR ROUTES ---

// Pool: Advisor picks new leads
app.get('/api/officer/available-requests', verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role ? req.user.role.toLowerCase() : "";
        if (userRole !== 'user' && userRole !== 'admin') {
            return res.status(403).json({ error: "Access Denied" });
        }

        // Fix: Shows both 'Applied' and 'Hold' leads
        const unassigned = await Loan.find({ 
            isAssigned: false, 
            status: { $in: ['Applied', 'Hold - Pending Assignment'] } 
        }).sort({ createdAt: -1 });
        
        res.json(unassigned);
    } catch (err) { res.status(500).json({ error: "Pool Fetch Error" }); }
});

// Accept Lead
// Accept Lead Fix: Support for both MongoDB _id and custom loanId
app.post('/api/officer/accept-loan/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // 🚀 Check: Agar ID 'LN-' se start ho rahi hai toh custom find karein, warna findById
        const query = id.startsWith('LN-') ? { loanId: id } : { _id: id };

        const loan = await Loan.findOneAndUpdate(
            query, 
            {
                fieldOfficerId: req.user.id,
                isAssigned: true,
                status: 'Pending Verification'
            }, 
            { new: true }
        );

        if (!loan) {
            return res.status(404).json({ error: "Loan not found in database" });
        }

        console.log(`✅ Loan ${id} accepted by ${req.user.fullName}`);
        res.json({ success: true, loan });
    } catch (err) { 
        console.error("❌ Accept Error Details:", err.message);
        res.status(500).json({ error: "Accept Error", details: err.message }); 
    }
});
// Submit Audit (PATCH)
app.patch('/api/loans/:id', verifyToken, async (req, res) => {
    try {
        const updatedLoan = await Loan.findByIdAndUpdate(
            req.params.id, 
            { $set: { ...req.body, status: 'Field Verified' } }, 
            { new: true }
        );
        res.json({ success: true, loan: updatedLoan });
    } catch (err) { res.status(500).json({ error: "Audit Submit Error" }); }
});

// --- 6. ACCOUNTANT & ADMIN DASHBOARD ---

// ==========================================
// 🛠️ FIXES FOR ADMIN ANALYTICS & MANAGEMENT
// ==========================================

// 1. DASHBOARD STATS (For Graphs)
app.get('/api/admin/stats', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin Only" });
        
        const loans = await Loan.find({});
        const customerCount = await User.countDocuments({ role: 'Customer' });
        
        // Total Disbursed Calculation
        const totalDisbursed = loans
            .filter(l => l.status === 'Disbursed')
            .reduce((sum, l) => sum + (l.amount || 0), 0);
            
        // Total Recovery Calculation (Approved Payments)
        let totalRecovered = 0;
        loans.forEach(loan => {
            loan.repaymentHistory?.forEach(pay => {
                if (pay.status === 'Approved') totalRecovered += (pay.amount || 0);
            });
        });

        res.json({ totalDisbursed, totalRecovered, customerCount });
    } catch (err) { res.status(500).json({ error: "Stats sync error" }); }
});

// 2. SEPARATE CUSTOMER LIST
app.get('/api/admin/all-customers', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin Only" });
        const customers = await User.find({ role: 'Customer' }).select('-password').sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) { res.status(500).json({ error: "Customers fetch error" }); }
});

// 3. ALL STAFF LIST (Admins, Accountants, Advisors)
app.get('/api/admin/all-staff', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin Only" });
        const staff = await User.find({ role: { $ne: 'Customer' } }).select('-password').sort({ role: 1 });
        res.json(staff);
    } catch (err) { res.status(500).json({ error: "Staff fetch error" }); }
});

// 4. UTR PAYMENT APPROVAL (Very Important)
app.post('/api/admin/approve-payment', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Accountant') return res.status(403).json({ error: "Unauthorized" });
        
        const { loanId, paymentId } = req.body;
        const loan = await Loan.findOne({ loanId: loanId });
        
        if (!loan) return res.status(404).json({ error: "Loan record not found" });

        // Payment status ko update karna
        const payment = loan.repaymentHistory.id(paymentId);
        if (payment) {
            payment.status = 'Approved';
            // Total Pending Amount kam karna
            loan.totalPending = Math.max(0, (loan.totalPending || 0) - payment.amount);
            await loan.save();
            res.json({ success: true, message: "Payment Verified & Approved!" });
        } else {
            res.status(404).json({ error: "Payment ID not found" });
        }
    } catch (err) { res.status(500).json({ error: "Approval failed: " + err.message }); }
});

// 5. DAILY COLLECTION REPORT
app.get('/api/admin/collection-report', verifyToken, async (req, res) => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);
        const loans = await Loan.find({ "repaymentHistory.status": "Approved" });
        
        let report = [];
        loans.forEach(loan => {
            loan.repaymentHistory.forEach(pay => {
                const payDate = new Date(pay.date).setHours(0, 0, 0, 0);
                if (payDate === today && pay.status === 'Approved') {
                    report.push({
                        _id: pay._id,
                        loanId: loan.loanId,
                        customerName: loan.customerName,
                        amount: pay.amount,
                        utr: pay.utr,
                        paymentDate: pay.date,
                        method: "UPI / QR"
                    });
                }
            });
        });
        res.json(report);
    } catch (err) { res.status(500).json({ error: "Report failed" }); }
});

// 6. DELETE USER ROUTE
app.delete('/api/admin/users/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin Only" });
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// ==========================================
// 🛠️ ADMIN MASTER CONTROL ROUTES (FIXED)
// ==========================================

// 1. Dashboard Stats (Graphs aur Cards ke liye)
app.get('/api/admin/stats', verifyToken, async (req, res) => {
    try {
        const loans = await Loan.find({});
        const customerCount = await User.countDocuments({ role: { $in: ['Customer', 'customer'] } });
        
        // Total Disbursed (Sirf wahi jo Disbursed ho chuke hain)
        const totalDisbursed = loans
            .filter(l => l.status === 'Disbursed')
            .reduce((sum, l) => sum + (l.amount || 0), 0);
            
        // Total Recovery (Sirf 'Approved' payments ka sum)
        let totalRecovered = 0;
        loans.forEach(loan => {
            loan.repaymentHistory?.forEach(pay => {
                if (pay.status === 'Approved') totalRecovered += (pay.amount || 0);
            });
        });

        res.json({ totalDisbursed, totalRecovered, customerCount });
    } catch (err) { res.status(500).json({ error: "Stats error" }); }
});

// 2. All Customers List (Sirf customers dikhane ke liye)
app.get('/api/admin/all-customers', verifyToken, async (req, res) => {
    try {
        // Case-insensitive check for 'Customer'
        const customers = await User.find({ 
            role: { $regex: /customer/i } 
        }).select('-password').sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) { res.status(500).json({ error: "Customer fetch error" }); }
});

// 3. All Staff List (Admin, Accountant, Advisors)
app.get('/api/admin/all-staff', verifyToken, async (req, res) => {
    try {
        const staff = await User.find({ 
            role: { $not: { $regex: /customer/i } } 
        }).select('-password').sort({ role: 1 });
        res.json(staff);
    } catch (err) { res.status(500).json({ error: "Staff fetch error" }); }
});

// 4. Daily Collection Report (Aaj ki approved recovery)
app.get('/api/admin/collection-report', verifyToken, async (req, res) => {
    try {
        const today = new Date().setHours(0, 0, 0, 0);
        const loans = await Loan.find({ "repaymentHistory.status": "Approved" });
        
        let report = [];
        loans.forEach(loan => {
            loan.repaymentHistory.forEach(pay => {
                const payDate = new Date(pay.date).setHours(0, 0, 0, 0);
                if (payDate === today && pay.status === 'Approved') {
                    report.push({
                        _id: pay._id,
                        loanId: loan.loanId,
                        customerName: loan.customerName,
                        amount: pay.amount,
                        utr: pay.utr,
                        date: pay.date,
                        method: "UPI / QR"
                    });
                }
            });
        });
        res.json(report);
    } catch (err) { res.status(500).json({ error: "Report failed" }); }
});

// 5. UTR Payment Approval Logic (Most Important)
app.post('/api/admin/approve-payment', verifyToken, async (req, res) => {
    try {
        const { loanId, paymentId } = req.body;
        // Loan dhundo chahe ID LN- se ho ya MongoDB ID ho
        const loan = await Loan.findOne({ loanId: loanId });
        
        if (!loan) return res.status(404).json({ error: "Loan not found" });

        const payment = loan.repaymentHistory.id(paymentId);
        if (payment) {
            payment.status = 'Approved';
            // Total balance kam karna
            loan.totalPending = Math.max(0, (loan.totalPending || 0) - payment.amount);
            await loan.save();
            res.json({ success: true, message: "Payment Approved!" });
        } else {
            res.status(404).json({ error: "Payment record missing" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Bulk Delete User
app.delete('/api/admin/users/:id', verifyToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});
// Add this in server.js under Admin Master Control section
app.get('/api/admin/all-loans', verifyToken, async (req, res) => {
    try {
        const loans = await Loan.find({}).sort({ createdAt: -1 });
        res.json(loans);
    } catch (err) {
        res.status(500).json({ error: "Fetch error" });
    }
});
// adminroutes.js ya server.js mein
app.post('/api/admin/change-password', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin Only" });

        const { userId, newPassword } = req.body;

        // Password hash karna zaroori hai (bcrypt use karein)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        res.json({ success: true, message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Password update failed" });
    }
});
// Sabhi users (Admin, Staff, Customer) ko fetch karne ke liye
app.get('/api/admin/all-users-absolute', verifyToken, async (req, res) => {
    try {
        // .find({}) ka matlab hai bina kisi filter ke sare users
        const users = await User.find({}).select('-password').sort({ role: 1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Master fetch error" });
    }
});
// backend/server.js mein ye add karo agar nahi hai
app.get('/api/user/my-dashboard', verifyToken, async (req, res) => {
    try {
        const officerId = req.user.id;
        
        // Leads jo abhi tak kisi ne nahi li
        const unassigned = await Loan.countDocuments({ 
            isAssigned: false, 
            status: { $in: ['Applied', 'Hold - Pending Assignment'] } 
        });

        // Leads jo is advisor (logged-in user) ke paas pending hain
        const pending = await Loan.countDocuments({ 
            fieldOfficerId: officerId, 
            status: { $in: ['Pending Verification', 'Verification Pending'] } 
        });

        res.json({ success: true, stats: { pending, unassigned } });
    } catch (err) {
        res.status(500).json({ error: "Dashboard stats failed" });
    }
});
// 3. Fix: Accountant Add Karne Ka Logic (Signup Route Update)
// Note: Aapka existing signup route hi kaam karega, bas dropdown mein 'Accountant' role bhejiye.

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 D-Finance Engine Running on Port ${PORT}`));