const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ messages: "Access Denied or token missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
