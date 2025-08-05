const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();


// ✅ Only allow one-time admin registration
router.post('/register', authController.registerAdmin);

// ✅ Login route for both admin and employees
router.post('/login', authController.login);

// ✅ Protected route - get current user profile
router.get('/profile', authMiddleware.authenticate, authController.getProfile);

// ✅ Refresh token
router.post('/refresh', authMiddleware.authenticate, authController.refreshToken);

// ✅ Logout
router.post('/logout', authMiddleware.authenticate, authController.logout);

module.exports = router; 