const authRoutes = require('./routes/authRoutes');

// ... baki middlewares ke baad
app.use('/api/auth', authRoutes);