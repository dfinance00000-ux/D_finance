const express = require('express');
const cors = require('cors');
// ... baki imports
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // 👈 1. Pehle import karo

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json()); // Body parser zaroori hai

// --- Routes Registration ---
app.use('/api/auth', authRoutes);

// 🔥 2. Ye line add karo, isi ki wajah se 404 aa raha tha
app.use('/api/payments', paymentRoutes); 

// ... baki routes jaise /api/loans wagera
// app.use('/api/loans', loanRoutes);

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));