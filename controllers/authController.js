const Auth = require("../models/authModel");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../services/emailService");

const SALT_ROUNDS = 10;

const createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

module.exports.Register = async (req, res) => {
  const { firstName, lastName, role, userName, email, password, acceptedTerms } = req.body;

  if (!firstName || !lastName || !email || !password || !role || !acceptedTerms) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if user already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Send verification email
    const verificationCode = await sendVerificationEmail(email);

    // Create new user
    const newUser = new Auth({
      firstName,
      lastName,
      userName,
      email,
      role,
      password: hashedPassword,
      acceptedTerms,
      verificationCode,
      verificationExpires: Date.now() + 3600000, // 1 hour
      accountCreated: dayjs().format("MMMM D, YYYY h:mm A"),
    });

    await newUser.save();
    res.status(201).json({ message: "New user created. Please verify your email." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({ message: "Email and verification code are required." });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: `No user found with email ${email}.` });
    }

    if (user.verificationCode !== verificationCode) {
      // Schedule deletion if the code is incorrect
      setTimeout(async () => {
        const userToDelete = await Auth.findOne({ email });
        if (userToDelete && userToDelete.verificationCode !== verificationCode && !userToDelete.isVerified) {
          await Auth.deleteOne({ email });
          console.log(`User with email ${email} deleted due to invalid verification code.`);
        }
      }, 5 * 60 * 1000); // 5 minutes

      return res.status(400).json({
        message: "Invalid verification code. You have 5 minutes to try again.",
      });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.VerifyCode = async (req, res) => {
  const { user } = req;

  try {
    const { accessToken, refreshToken } = createTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 3600000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 604800000,
    });

    res.status(200).json({
      message: "Verified Successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.Login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required." });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password." });
    }

    if (!user.role?.includes(role)) {
      user.role = user.role || [];
      user.role.push(role);
      await user.save();
    }

    const { accessToken, refreshToken } = createTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite:"lax",
      maxAge: 604800000,
    });

    res.status(200).json({
      message: "Logged In Successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.Logout = async (req,res)=>{
  res.clearCookie('accessToken', { httpOnly: true, secure: false, sameSite: 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'lax' });
  res.status(200).json({ message: 'Logged out successfully' });
}