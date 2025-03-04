const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.authenticateToken = async (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies.accessToken;

  // If no token is found in the cookies, respond with an unauthorized error
  if (!token) {
    return res.status(401).json({ message: "Access Denied: Token missing" });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information (e.g., userId, role) to the request object
    req.user = decoded;  // Store the decoded token in the req.user object

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle different JWT-related errors

    if (error.name === "TokenExpiredError") {
      // If the token has expired, prompt the user to log in again
      return res.status(401).json({ message: "Token expired, please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      // If the token is invalid, respond with a bad request error
      return res.status(400).json({ message: "Invalid token. Please check your credentials." });
    } else {
      // General error handling for unexpected cases
      console.error("Error verifying token:", error);  // Log the error for debugging
      return res.status(500).json({ message: "An error occurred while verifying the token. Please try again later." });
    }
  }
};
