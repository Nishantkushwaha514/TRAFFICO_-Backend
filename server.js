require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db.config.js'); // Imports DB connection utility

// 1. Import all route files:
const authRoutes = require('./src/routes/auth.routes'); 
const reportRoutes = require('./src/routes/report.routes'); 
const dashboardRoutes = require('./src/routes/dashboard.routes'); // <-- ADDED 🚀

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());              
app.use(express.json());      

// 2. Connect all routes using the base paths from Claude's spec:
app.use('/api/auth', authRoutes);      
app.use('/api/reports', reportRoutes);  
app.use('/api/dashboard', dashboardRoutes); // <-- CONNECTED DASHBOARD 📊


// Basic Route (Test connectivity)
app.get('/', (req, res) => {
  res.status(200).send('🚀 Traffico Backend is Running Successfully!');
});

// Start Server and Connect to DB
const startServer = async () => {
  await connectDB(); // Ensure DB connection is made
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();