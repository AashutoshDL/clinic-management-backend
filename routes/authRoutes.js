const express = require("express");
const router = express.Router();

// Import controller functions
const { Register, Login, verifyEmail} = require("../controllers/authController");

router.post("/register", Register); // Use rateLimiter middleware
router.post("/login", Login); // Use rateLimiter middleware
router.post("/verifyEmail",verifyEmail); // Use rateLimiter middleware

module.exports = router;
