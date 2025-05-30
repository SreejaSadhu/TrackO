require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
// Initialize Express
const app = express();
// Production-ready CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));
app.use(express.json());
// Route Imports
const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
// Initialize DB Connection
let isConnected = false;
const startServer = async () => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    // API Routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/income', incomeRoutes);
    app.use('/api/v1/expense', expenseRoutes);
    app.use('/api/v1/dashboard', dashboardRoutes);
    app.use('/api/v1/budget', budgetRoutes);
    // Static Files
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    // Error Handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    });
    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    return app;
  } catch (error) {
    console.error('Server startup error:', error);
    throw error;
  }
};
// Serverless Export
module.exports = startServer();
