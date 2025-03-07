const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.authenticateToken = async (req, res, next) => {
  const token = req.cookies.accessToken || req.body.accessToken;

  if (!token) {
    return res.status(404).json({ message: "Access Denied: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token. Please check your credentials." });
    } else {
      console.error("Error verifying token:", error);
      return res.status(500).json({ message: "An error occurred while verifying the token. Please try again later." });
    }
  }
};