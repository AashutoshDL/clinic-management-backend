const Patient = require("../models/patientModel");

module.exports.verifyCode = async (req, res, next) => {
  const { email, code } = req.body;

  try {

    const user = await Patient.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    if (
      user.verificationCode !== code ||
      Date.now() > user.verificationExpires
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    req.user = user;
    next(); 
  } catch (error) {
    console.error("Error in verifyCodeMiddleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
