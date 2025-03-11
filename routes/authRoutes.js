const express = require("express");
const router = express.Router();

// Import controller functions
const { Register, Login, verifyEmail, Logout} = require("../controllers/authController");
// const { refreshAccessToken }= require("../tokens/tokensController");

router.post("/register", Register);
router.post("/login", Login);
router.post("/verifyEmail",verifyEmail);
// router.post('/refreshAccessToken',refreshAccessToken)
router.post('/logout',Logout)

module.exports = router;
    