const Auth = require("../models/authModel");
const dayjs = require('dayjs');
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../services/emailService");

module.exports.Register = async (req, res) => {
  const { firstName, lastName, role, userName, email, password, acceptedTerms } = req.body;
  try {
    //checking for existing user
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //hashing the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const verificationCode = await sendVerificationEmail(email);

    //creating a new user
    const newUser = new Auth({
      firstName,
      lastName,
      userName,
      email,
      role,
      password: hashedPassword,
      acceptedTerms,
      verificationCode: verificationCode,
      verificationExpires: Date.now() + 3600000,
      accountCreated: dayjs().format('MMMM D, YYYY h:mm A'),
    });

    await newUser.save();

    res.status(201).json({ message: "New user created" });
  } catch (error) {
    console.error("error registering user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Check if the user exists
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: `We do not have information on ${email} you` });
    }

    // Check if the verification code matches
    if (user.verificationCode !== verificationCode) {
      // Schedule user deletion if the verification code is incorrect
      setTimeout(async () => {
        const userToDelete = await Auth.findOne({ email });
        if (userToDelete && userToDelete.verificationCode !== verificationCode && !userToDelete.isVerified) {
          await Auth.deleteOne({ email });
          console.log(`User with email ${email} deleted due to invalid verification code.`);
        }
      }, 5 * 60 * 1000); // 5 minutes

      return res.status(400).json({ message: "Invalid Verification Code. You have 5 minutes to try again." });
    }

    // Verify the user if the code matches
    user.isVerified = true;
    user.verificationCode = null; // Clear the verification code after successful verification
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

module.exports.VerifyCode = async (req, res) => {
  const { user } = req;
  const { accessToken, refreshToken } = createTokens(user);

  res.cookie("accessToken", accessToken, { 
    httpOnly: true, 
    secure:false,
    sameSite:"none",
    maxAge: 3600000 
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:false,
    sameSite:"none", 
    maxAge: 604800000,
  });

  res.status(200).json({
    message: "Verified Successfully",
    accessToken,
    refreshToken,
  });
};

module.exports.Login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if both email and role are provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Find the user by email and role
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "You are not registered.Please register." });
    }

    if(role && user.role !== role){
      user.role=role;
      await user.save();
    }

    // Compare the provided password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create JWT tokens (access and refresh tokens)
    const { accessToken, refreshToken } = createTokens(user);

    // Store tokens in HTTP-only cookies
    res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiry for accessToken
    res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 604800000 }); // 7 days expiry for refreshToken

    // Send a success response with a message and tokens
    return res.status(200).json({
      message: "Logged In Successfully",
      // accessToken,
      // refreshToken,
      user: { firstName: user.firstName, email: user.email, role : user.role },
    });
  } catch (error) {
    console.error("Error logging in the user", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};