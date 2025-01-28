const express = require("express");
const router = express.Router();

// Import controller functions
const { Register, Login, verifyEmail, Logout,refreshToken,me} = require("../controllers/authController");

router.post("/register", Register);
router.post("/login", Login);
router.post("/verifyEmail",verifyEmail);
router.post('/refreshToken',refreshToken)
router.post('/logout',Logout)
router.get('/me',me);

module.exports = router;
