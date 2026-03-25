const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// SIGNUP LOGIC
exports.signup = async (req, res) => {
    try {
        const { fullName, mobile, email, password, sponsorId, role } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ mobile });
        if (user) return res.status(400).json({ message: "User already exists with this mobile" });

        user = new User({ fullName, mobile, email, password, sponsorId, role });
        await user.save();

        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// LOGIN LOGIC
exports.login = async (req, res) => {
    try {
        const { mobile, password, role } = req.body;

        const user = await User.findOne({ mobile, role });
        if (!user) return res.status(400).json({ message: "Invalid Credentials or Role" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

        // Generate JWT Token
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
        res.status(500).json({ success: false, error: error.message });
    }
};