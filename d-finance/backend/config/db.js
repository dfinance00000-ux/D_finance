const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    // Force IPv4 and simple connection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, 
    });

    console.log("✅ MongoDB Atlas Connected! (Bypassed DNS Block)");
  } catch (error) {
    console.error("❌ Connection Error:", error.message);
  }
};

module.exports = connectDB;