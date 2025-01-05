// const express = require("express");
// const passport = require("passport");
// const router = express.Router();

// // Initiate Google OAuth
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Handle Google OAuth callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login", // Frontend route for failed login
//   }),
//   (req, res) => {
//     res.redirect("/home"); // Redirect after successful login
//   }
// );

// // Logout
// router.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) return res.status(500).json({ message: "Logout failed" });
//     res.redirect("/");
//   });
// });

// module.exports = router;
