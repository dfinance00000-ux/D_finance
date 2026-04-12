const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const loanRoutes = require('./routes/loanRoutes');

const app = express();

// --- 1. Basic Middlewares ---
app.use(cors());

// --- 2. JSON & Raw Body Parser (Fixed) ---
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Necessary for Cashfree signature
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 3. 🔍 EMERGENCY TEST ROUTE (Abhi check karne ke liye) ---
app.post('/api/payments/test-hit', (req, res) => {
    console.log("✅ Manual POST Test Successful!");
    res.status(200).json({ status: "Working", message: "API is accepting POST" });
});

// --- 4. Routes Registration ---
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes); 
app.use('/api/loans', loanRoutes);

// --- 5. 404 Handler (Agar rasta nahi mila toh console mein dikhega) ---
app.use((req, res) => {
    console.log(`❌ 404 Error: ${req.method} ${req.url}`);
    res.status(404).send(`Route ${req.url} Not Found on this Server`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));