const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware'); // <-- NEW IMPORT

// USER DASHBOARD ENDPOINTS

// GET /api/dashboard/stats (Requires login)
router.get('/stats', verifyToken, dashboardController.getStats); // <-- ADDED verifyToken

module.exports = router;