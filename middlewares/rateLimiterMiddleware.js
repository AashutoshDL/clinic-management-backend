
const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 25, 
  message: {
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, 
  legacyHeaders: true, 
});

module.exports = rateLimiter;
