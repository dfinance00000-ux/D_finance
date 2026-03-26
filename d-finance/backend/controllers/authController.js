const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- 1. SIGNUP LOGIC ---
exports.signup = async (req, res) => {
    try {
        const { fullName, mobile, email, password, sponsorId, role, adhaar, pan } = req.body;
        console.log(`📩 Signup Attempt: ${mobile}`);

        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ error: "Mobile number pehle se registered hai." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Role Formatting: DB mein hamesha Capital A/C save hoga
        let formattedRole = 'Customer'; 
        if (role) {
            const r = role.toLowerCase();
            if (r.includes('admin')) formattedRole = 'Admin';
            else if (r.includes('user') || r.includes('advisor')) formattedRole = 'User';
        }

        user = new User({ 
            fullName, 
            mobile, 
            email: email ? email.toLowerCase().trim() : "", 
            password: hashedPassword, 
            sponsorId, 
            role: formattedRole,
            adhaar,
            pan
        });

        await user.save();
        console.log(`✅ User Created: ${fullName} as ${formattedRole}`);
        res.status(201).json({ success: true, message: "Signup Successful!" });
    } catch (error) {
        console.error("❌ Signup Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- 2. LOGIN LOGIC ---
exports.login = async (req, res) => {
    try {
        const { mobile, password, role } = req.body;
        console.log(`🔍 Login Request: Mobile: ${mobile}, Selected Role: ${role}`);

        // Step 1: Mobile se user dhoondo
        const user = await User.findOne({ mobile });
        
        if (!user) {
            console.log("❌ Error: Mobile number database mein nahi mila.");
            return res.status(400).json({ error: "Is number ka koi account nahi mila." });
        }

        console.log(`✅ User Found in Atlas: ${user.fullName} | DB Role: ${user.role}`);

        // Step 2: Smart Role Matching (Case Insensitive)
        let normalizedSelectedRole = 'Customer';
        const r = role.toLowerCase();
        if (r.includes('admin')) normalizedSelectedRole = 'Admin';
        else if (r.includes('user') || r.includes('advisor')) normalizedSelectedRole = 'User';

        if (user.role !== normalizedSelectedRole) {
            console.log(`❌ Role Mismatch: DB has '${user.role}', but you chose '${role}'`);
            return res.status(400).json({ 
                error: `Role mismatch. Database mein aapka role '${user.role}' hai.` 
            });
        }

        // Step 3: Password Check
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Error: Password mismatch.");
            return res.status(400).json({ error: "Password galat hai." });
        }

        // Step 4: Token Generation
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        console.log(`🚀 Login Success for: ${user.fullName}`);
        res.json({
            success: true,
            token,
            user: { id: user._id, fullName: user.fullName, role: user.role }
        });

    } catch (error) {
        console.error("❌ Login Server Error:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};