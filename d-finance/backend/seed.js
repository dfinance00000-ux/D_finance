require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Loan = require('./models/Loan');
const Payment = require('./models/Payment');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB for Seeding...");

        // 1. Purana data saaf
        await User.deleteMany({});
        await Loan.deleteMany({});
        await Payment.deleteMany({});
        console.log("🧹 Database Cleared!");

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash("admin123", salt);

        // 3. Create Admin
        const admin = new User({
            fullName: "Aditya Admin",
            mobile: "9876543210",
            password: hashed,
            role: "Admin",
            email: "admin@dfinance.com"
        });

        await admin.save();
        console.log("🚀 Admin Created: 9876543210 / admin123");
        
        console.log("🌟 Seeding Complete! Press Ctrl+C to exit.");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
        process.exit(1);
    }
};

seedDatabase();