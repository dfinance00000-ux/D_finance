const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- 1. SIGNUP LOGIC ---
exports.signup = async (req, res) => {
    try {
        const { fullName, mobile, email, password, sponsorId, role, adhaar, pan } = req.body;
        
        // 1. Check if user already exists
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ error: "User already exists with this mobile number" });
        }

        // 2. Password Hashing (Zaroori: Kyunki login mein hum bcrypt use kar rahe hain)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create New User with Hashed Password
        user = new User({ 
            fullName, 
            mobile, 
            email: email.toLowerCase().trim(), 
            password: hashedPassword, 
            sponsorId, 
            role: role || 'Customer', // Default role Customer rahega
            adhaar,
            pan
        });

        await user.save();

        res.status(201).json({ 
            success: true, 
            message: "User registered successfully! Please login." 
        });
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ success: false, error: "Registration failed. Please try again." });
    }
};

// --- 2. LOGIN LOGIC ---
exports.login = async (req, res) => {
    try {
        const { mobile, password, role } = req.body;

        // 1. Find User by mobile and role (Role match hona zaroori hai)
        const user = await User.findOne({ mobile, role });
        if (!user) {
            return res.status(400).json({ error: "No account found with this role/mobile" });
        }

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password. Please try again." });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // 4. Send Success Response
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
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};