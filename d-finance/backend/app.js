const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // 1. Import
const loanRoutes = require('./routes/loanRoutes');

const app = express();

// --- Middlewares ---
app.use(cors());
// app.use(express.json()); // 👈 Ye line Webhook ka JSON data padhne ke liye sabse zaroori hai
// app.js mein express.json() ko aise likho taaki raw body mil sake

 app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Ye signature verify karne ke liye zaroori hai
  }
}));
// --- Routes Registration ---
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes); // 🔥 2. Route register ho gaya
app.use('/api/loans', loanRoutes);

// Server start...
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));