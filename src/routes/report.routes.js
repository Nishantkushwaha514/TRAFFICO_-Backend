const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth.middleware'); // <-- NEW IMPORT

// VIOLATION REPORTING ENDPOINTS

// 1. GET /api/reports/upload-url (Requires login)
router.get('/upload-url', verifyToken, reportController.generateUploadUrl); // <-- ADDED verifyToken

// 2. POST /api/reports (Requires login)
router.post('/', verifyToken, reportController.submitReport); // <-- ADDED verifyToken

// Future endpoints from Claude's spec will go here:
// router.get('/:reportId', verifyToken, reportController.getReportDetails); 

module.exports = router;