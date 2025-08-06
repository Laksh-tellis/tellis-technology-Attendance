const express = require('express');
const router = express.Router();
const userController = require('../controllers/adduser.controller');
const { isAdmin } = require('../middlewares/authMiddleware');

// Admin only
router.post('/create-user', isAdmin,userController.createUser);



module.exports = router;