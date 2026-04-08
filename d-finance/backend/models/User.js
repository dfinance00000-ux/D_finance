const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    mobile: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        index: true // Login search fast karne ke liye
    },
    email: { 
        type: String, 
        unique: true, 
        lowercase: true, 
        trim: true,
        sparse: true // Email optional hai, isliye duplicate nulls se bachata hai
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // 🔥 Role Management (Auto-Redirect Dashboard isi par base hai)
    role: { 
        type: String, 
        enum: ['Admin', 'User', 'Accountant', 'Customer', 'Advisor'], 
        default: 'Customer' 
    },

    // KYC Details (Security & Verification)
    adhaar: { type: String, unique: true, sparse: true },
    pan: { type: String, unique: true, sparse: true },
    cibilScore: { type: Number, default: 0 },
    
    // Identity Details
    address: { type: String },
    dob: { type: String },
    gender: { type: String },

    // Business Logic
    sponsorId: { type: String }, 
    branch: { type: String, default: 'Mathura Branch' },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Blocked'], 
        default: 'Active' 
    },

    // Tracking
    lastLogin: { type: Date },
}, { timestamps: true });

/**
 * Password Compare Method
 * Iska use karke aap login controller mein seedha check kar sakte hain:
 * const isMatch = await user.comparePassword(password);
 */
UserSchema.methods.comparePassword = async function(enteredPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export Logic: Model re-compilation error se bachne ke liye
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);