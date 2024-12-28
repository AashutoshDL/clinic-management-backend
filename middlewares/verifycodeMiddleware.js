const Auth = require("../models/authModel");

module.exports.verifyCode = async (req, res, next) => {
  const { email, code } = req.body;

  try {
    // Find user by email
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // Check if the verification code is correct and has not expired
    if (
      user.verificationCode !== code ||
      Date.now() > user.verificationExpires
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    // Add the user to the request object for further use in the controller
    req.user = user;
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Error in verifyCodeMiddleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
