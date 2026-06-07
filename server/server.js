require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const featuresRoutes = require('./routes/featuresRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL, // Your Vercel URL e.g. https://resumeai.vercel.app
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/features', featuresRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Job Assistant API is running 🚀' });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Make sure MongoDB is running locally or update MONGODB_URI in .env');
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
});
