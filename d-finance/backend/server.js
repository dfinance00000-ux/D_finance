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
app.use(cors({ 
    origin: ["http://localhost:5173", "https://d-finance-izsi.vercel.app","https://dfinance.space"], 
    credentials: true 
})); 
app.use(express.json());

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

app.get('/api/accountant/pending', verifyToken, async (req, res) => {
    try {
        const role = req.user.role.toLowerCase();
        if (role !== 'accountant' && role !== 'admin') {
            return res.status(403).json({ error: "Access Denied" });
        }
        const loans = await Loan.find({ status: 'Field Verified' }).sort({ updatedAt: -1 });
        res.json(loans);
    } catch (err) { res.status(500).json({ error: "Accountant fetch error" }); }
});

app.get('/api/user/my-dashboard', verifyToken, async (req, res) => {
    try {
        const officerId = req.user.id;
        const unassigned = await Loan.countDocuments({ 
            isAssigned: false, 
            status: { $in: ['Applied', 'Hold - Pending Assignment'] } 
        });
        const pending = await Loan.countDocuments({ 
            fieldOfficerId: officerId, 
            status: { $in: ['Pending Verification', 'Verification Pending'] } 
        });

        res.json({ success: true, stats: { pending, unassigned } });
    } catch (err) { res.status(500).json({ error: "Dashboard stats failed" }); }
});

// Fix for Admin Performance Page
app.get('/api/admin/all-users', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) { res.status(500).json({ error: "Users fetch error" }); }
});

app.get('/api/admin/all-loans', verifyToken, async (req, res) => {
    try {
        const loans = await Loan.find({}).sort({ createdAt: -1 });
        res.json(loans);
    } catch (err) { res.status(500).json({ error: "Loans fetch error" }); }
});
// --- ADMIN: MASTER CONTROL ROUTES ---

// 1. Fix: /admin/approvals (Shows loans ready for Admin's final look)
app.get('/api/admin/pending-approvals', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin Only" });
        // Wo saare loans jo Advisor ne verify kar diye hain ya Accountant ke paas hain
        const loans = await Loan.find({ 
            status: { $in: ['Field Verified', 'Pending Accountant Approval', 'Applied'] } 
        }).sort({ createdAt: -1 });
        res.json(loans);
    } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
});

// 2. Fix: /admin/advisor-performance (Calculates stats per Advisor)
app.get('/api/admin/advisor-stats', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') return res.status(403).json({ error: "Admin Only" });
        
        // Sabhi Advisors (User role) nikalna
        const advisors = await User.find({ role: { $in: ['User', 'FieldOfficer'] } });
        
        const performanceData = await Promise.all(advisors.map(async (adv) => {
            const assigned = await Loan.countDocuments({ fieldOfficerId: adv._id });
            const verified = await Loan.countDocuments({ fieldOfficerId: adv._id, status: 'Field Verified' });
            const disbursed = await Loan.countDocuments({ fieldOfficerId: adv._id, status: 'Disbursed' });
            
            return {
                advisorName: adv.fullName,
                mobile: adv.mobile,
                assigned,
                verified,
                disbursed,
                commission: disbursed * 500 // Example: ₹500 per disbursement
            };
        }));
        
        res.json(performanceData);
    } catch (err) { res.status(500).json({ error: "Performance Sync Error" }); }
});

// 3. Fix: Accountant Add Karne Ka Logic (Signup Route Update)
// Note: Aapka existing signup route hi kaam karega, bas dropdown mein 'Accountant' role bhejiye.

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 D-Finance Engine Running on Port ${PORT}`));