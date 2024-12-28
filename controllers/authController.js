const Auth = require("../models/authModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../services/emailService");

module.exports.Register = async (req, res) => {
  const { username, email, password } = req.body;
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

    //creating a new user`
    const newUser = new Auth({
      username,
      email,
      password: hashedPassword,
      verificationCode: verificationCode,
      verificationExpires: Date.now() + 3600000,
    });

    await newUser.save();

    res.status(201).json({ message: "New user created" });
  } catch (error) {
    console.error("error registering user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_Secret,
    { expiresIn: "5h" }
  );

  const refereshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFERESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refereshToken };
};

module.exports.VerifyCode = async (req, res) => {
  const { user } = req;
  const { accessToken, refereshToken } = createTokens(user);

  res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 3600000 });
  res.cookie("refereshToken", refereshToken, {
    httpOnly: true,
    maxAge: 604800000,
  });

  res.status(200).json({
    message: "Verified Successfully",
    accessToken,
    refereshToken,
  });
};

module.exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(404).json({ messahe: "Invalid Verification Code" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ messsage: "Email verified Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

module.exports.Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await Auth.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid email or No user. Please register" });
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // If everything is correct, create token
    const { accessToken, refereshToken } = createTokens(user);

    res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 3600000 });
    res.cookie("refreshToken", refereshToken, {
      httpOnly: true,
      maxAge: 604800000,
    });

    // Send the success response with token
    return res
      .status(200)
      .json({ message: "Logged In", accessToken, refereshToken });
  } catch (error) {
    console.error("Error Logging the user", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
