const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- 1. SIGNUP LOGIC ---
exports.signup = async (req, res) => {
    try {
        const { fullName, mobile, email, password, sponsorId, role, adhaar, pan } = req.body;
        
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ error: "Is number se account pehle se bana hai." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Role handling: Frontend se agar role nahi aaya toh 'Customer'
        user = new User({ 
            fullName, 
            mobile, 
            email: email ? email.toLowerCase().trim() : "", 
            password: hashedPassword, 
            sponsorId, 
            role: role || 'Customer',
            adhaar,
            pan
        });

        await user.save();
        res.status(201).json({ success: true, message: "Registration successful!" });
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ success: false, error: "Signup fail ho gaya." });
    }
};

// --- 2. LOGIN LOGIC (IMPROVED) ---
exports.login = async (req, res) => {
    try {
        const { mobile, password, role } = req.body;

        // 1. Pehle sirf mobile se user dhoondo
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ error: "Is mobile number ka koi account nahi mila." });
        }

        // 2. Role Check (Case-Insensitive & Dynamic)
        // Agar Frontend se 'System Administrator' aa raha hai aur DB mein 'Admin' hai
        const frontendRole = role.toLowerCase();
        const dbRole = user.role.toLowerCase();

        // Kuch common roles ka mapping (taki mismatch na ho)
        const roleMapping = {
            "system administrator": "admin",
            "advisor / agent": "user",
            "valued customer": "customer"
        };

        const normalizedFrontendRole = roleMapping[frontendRole] || frontendRole;

        if (dbRole !== normalizedFrontendRole && dbRole !== frontendRole) {
            return res.status(400).json({ 
                error: `Role Mismatch! Aapne '${role}' select kiya hai, lekin database mein aapka role '${user.role}' hai.` 
            });
        }

        // 3. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Password galat hai." });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: { 
                id: user._id, 
                fullName: user.fullName, 
                role: user.role,
                mobile: user.mobile 
            }
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, error: "Server Error: Login nahi ho paya." });
    }
};