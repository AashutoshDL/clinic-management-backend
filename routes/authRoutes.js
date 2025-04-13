const express = require("express");
const router = express.Router();

const { Register, Login, verifyEmail, Logout} = require("../controllers/authController");


router.post("/register", Register);
router.post("/login", Login);
router.post("/verifyEmail",verifyEmail);

router.post('/logout',Logout)

module.exports = router;
    