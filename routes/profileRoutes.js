const express = require("express");
const router = express.Router();
const { Profile } = require("../controllers/profileController");
const {
  authenticateToken,
} = require("../middlewares/authenticationMiddleware");

router.get("/profile", authenticateToken, Profile);

module.exports = router;
