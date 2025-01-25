// rateLimiterMiddleware.js
const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 5 requests per window
  message: {
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Set the `X-RateLimit-*` headers
});

module.exports = rateLimiter;
