const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.authenticateToken = async (req, res, next) => {
  // Retrieve the token only from cookies
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Access Denied or token missing" });
  }

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle invalid or expired tokens
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token" });
    } else {
      return res.status(500).json({ message: "An error occurred while verifying the token" });
    }
  }
};
