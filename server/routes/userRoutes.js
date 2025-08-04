const express = require("express");
const router = express.Router();
const {registerUser, loginUser, getProfile} = require("../controller/userController");
const {verifyToken} = require("../middleware/authMiddlewware");     
const {apiLimiter} = require("../middleware/rateLimiter");

router.post("/register",apiLimiter,registerUser);
router.post("/login",apiLimiter,loginUser);
router.get("/profile",verifyToken,getProfile);


module.exports= router;