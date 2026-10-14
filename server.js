require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. IMPORT THE ENTIRE DB CONFIG OBJECT
const dbConfig = require('./src/config/db.config.js'); 

// 2. Import all route files:
const authRoutes = require('./src/routes/auth.routes'); 
const reportRoutes = require('./src/routes/report.routes'); 
const dashboardRoutes = require('./src/routes/dashboard.routes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());              
app.use(express.json());      

// 3. Connect all routes
app.use('/api/auth', authRoutes);      
app.use('/api/reports', reportRoutes);  
app.use('/api/dashboard', dashboardRoutes);

// Basic Route (Test connectivity)
app.get('/', (req, res) => {
  res.status(200).send('🚀 Traffico Backend is Running Successfully!');
});

// Start Server and Connect to DB
const startServer = async () => {
  // Use the connectDB function from the imported config object
  await dbConfig.connectDB(); 
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();