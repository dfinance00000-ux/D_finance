const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- 1. SIGNUP LOGIC ---
exports.signup = async (req, res) => {
    try {
        const { fullName, mobile, email, password, sponsorId, role, adhaar, pan } = req.body;
        
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ error: "Mobile number already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Role formatting to match your Database (Capital A and C)
        let formattedRole = 'Customer'; 
        if (role) {
            const r = role.toLowerCase();
            if (r.includes('admin')) formattedRole = 'Admin';
            else if (r.includes('user') || r.includes('advisor')) formattedRole = 'User';
            else formattedRole = 'Customer';
        }

        user = new User({ 
            fullName, 
            mobile, 
            email: email ? email.toLowerCase().trim() : "", 
            password: hashedPassword, 
            sponsorId, 
            role: formattedRole, // "Admin" or "Customer"
            adhaar,
            pan
        });

        await user.save();
        res.status(201).json({ success: true, message: "Signup Successful!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- 2. LOGIN LOGIC ---
exports.login = async (req, res) => {
    try {
        const { mobile, password, role } = req.body;

        // Step 1: Mobile se user dhoondo
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ error: "Mobile number nahi mila." });
        }

        // Step 2: Role Matching (Capital A / Capital C Check)
        // Frontend se 'Admin' ya 'System Administrator' aaye, hum 'Admin' check karenge
        let checkRole = 'Customer';
        const r = role.toLowerCase();
        if (r.includes('admin')) checkRole = 'Admin';
        else if (r.includes('user') || r.includes('advisor')) checkRole = 'User';

        if (user.role !== checkRole) {
            return res.status(400).json({ 
                error: `Role mismatch. DB has '${user.role}', but you selected '${role}'.` 
            });
        }

        // Step 3: Password Check
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Password galat hai." });
        }

        // Step 4: Token Generation
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: { id: user._id, fullName: user.fullName, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error during login." });
    }
};