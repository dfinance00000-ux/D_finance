const express = require('express');
const cors = require('cors');
const path = require('path'); // Path module zaroori hai
const paymentRoutes = require('./routes/paymentRoutes');
const loanRoutes = require('./routes/loanRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. CORS pehle
app.use(cors());

// 2. Body Parser (Webhook Friendly)
// Isse normal JSON bhi chalega aur Webhook signature bhi verify hoga
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.includes('/webhook')) {
      req.rawBody = buf.toString();
    }
  }
}));

app.use(express.urlencoded({ extended: true }));

// 3. 🚨 API ROUTES (Hamesha Static files se upar hone chahiye)
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/loans', loanRoutes);

// 4. Static Files (Frontend Build)
// Yahan check karo ki path sahi hai ya nahi
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 5. SPA Routing (Sabse aakhri rasta)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));