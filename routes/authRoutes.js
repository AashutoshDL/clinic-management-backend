const express = require("express");
const router = express.Router();

// Import the rateLimiter middleware
const rateLimiter = require("../middlewares/rateLimiterMiddleware");
// const rateLimiterMiddleware = require("../middlewares/rateLimiterMiddleware");

// Import controller functions
const { Register, Login, verifyEmail } = require("../controllers/authController");

// Use the rateLimiter as a middleware function in the routes
router.post("/register", rateLimiter, Register); // Use rateLimiter middleware
router.post("/login", rateLimiter, Login); // Use rateLimiter middleware
router.post("/verifyEmail", rateLimiter, verifyEmail); // Use rateLimiter middleware

module.exports = router;
