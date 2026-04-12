const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const loanRoutes = require('./routes/loanRoutes');

const app = express();

// --- 1. Trust Proxy (Render/Cloudflare ke liye zaroori hai) ---
app.set('trust proxy', 1);

// --- 2. Optimized CORS ---
app.use(cors({
  origin: ["https://dfinance.space", "http://localhost:5173"], // Sirf apne domains allow karein
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// --- 3. JSON & Raw Body Parser ---
// Iska order hamesha routes se upar hona chahiye
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Cashfree Webhook signature verification ke liye rawBody chahiye
    req.rawBody = buf.toString(); 
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 4. Request Logger (Debugging ke liye) ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- 5. Routes Registration ---
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes); 
app.use('/api/loans', loanRoutes);

// --- 6. Emergency Health Check ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "Live", domain: "dfinance.space" });
});

// --- 7. Final 404 Handler ---
app.use((req, res) => {
    console.log(`❌ Route Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route not found", path: req.url });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 D-Finance Backend Running on Port ${PORT}`));