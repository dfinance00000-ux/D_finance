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
        trim: true 
    },
    email: { 
        type: String, 
        unique: true, 
        lowercase: true, 
        trim: true,
        sparse: true // Email optional rakhne ke liye sparse zaroori hai
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // Fintech Specific Roles
    role: { 
        type: String, 
        enum: ['Admin', 'User', 'Accountant', 'Customer', 'Advisor'], 
        default: 'Customer' 
    },

    // KYC Details (Sandbox API se aayengi)
    adhaar: { type: String, unique: true, sparse: true },
    pan: { type: String, unique: true, sparse: true },
    cibilScore: { type: Number, default: 0 },
    
    // Address & Identity (Auto-filled from Aadhaar)
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

    // Meta Data
    lastLogin: { type: Date },
}, { timestamps: true });

// Password Compare Method (Login controller ko aur asaan banata hai)
UserSchema.methods.comparePassword = async function(enteredPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- IMPORTANT: Password Hashing yahan se hata di hai ---
// Kyunki hum server.js/authControl.js mein pehle hi hash kar rahe hain.
// Double hashing se bachne ke liye ye zaroori hai.

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);