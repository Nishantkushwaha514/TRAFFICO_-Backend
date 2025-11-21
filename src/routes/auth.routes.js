const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// AUTHENTICATION ENDPOINTS (from Claude's spec)
// POST /api/auth/register
router.post('/register', userController.signup);
// POST /api/auth/login
router.post('/login', userController.login);

module.exports = router;