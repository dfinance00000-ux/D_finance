const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    
    // Fintech Specific Roles
    role: { 
        type: String, 
        enum: ['Admin', 'User', 'Accountant', 'Customer'], 
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
    sponsorId: { type: String }, // Referrer / Advisor ID
    branch: { type: String, default: 'Mathura Branch' },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Blocked'], 
        default: 'Active' 
    },

    // Meta Data
    lastLogin: { type: Date },
}, { timestamps: true });

// Password hashing before saving
UserSchema.pre('save', async function(next) {
    // Agar password change nahi hua toh hashing skip karo
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Password Compare Method (Login ke liye asaan rahega)
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);