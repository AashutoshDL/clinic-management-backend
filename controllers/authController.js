const Auth = require("../models/authModel");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../services/emailService");
const Doctor = require("../models/doctorModel");
const Patient = require("../models/patientModel");

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
  const { firstName, lastName, userName, email, password, acceptedTerms } = req.body;

  if (!firstName || !lastName || !email || !password || !acceptedTerms || !userName) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const verificationCode = await sendVerificationEmail(email);

    const newUser = new Auth({
      firstName,
      lastName,
      userName,
      email,
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
      setTimeout(async () => {
        const userToDelete = await Auth.findOne({ email });
        if (userToDelete && userToDelete.verificationCode !== verificationCode && !userToDelete.isVerified) {
          await Auth.deleteOne({ email });
          console.log(`User with email ${email} deleted due to invalid verification code.`);
        }
      }, 5 * 60 * 1000);

      return res.status(400).json({
        message: "Invalid verification code. You have 5 minutes to try again.",
      });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
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

    if (role === "doctor") {
      let doctor = await Doctor.findOne({ email });
      if (!doctor) {
        doctor = new Doctor({
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
        await doctor.save();
      }

      if (!user.role.includes("doctor")) {
        user.role.push("doctor");
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
        sameSite: "lax",
        maxAge: 604800000,
      });

      return res.status(200).json({
        message: "Logged In Successfully as Doctor",
        user: {
          id: doctor.id,
          firstName: user.firstName,
          email: user.email,
          roles: user.role,
        },
      });
    } else if (role === "patient") {
      let patient = await Patient.findOne({ email });
      if (!patient) {
        patient = new Patient({
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role:role,
        });
        await patient.save();
      }
      
      if (!user.role.includes("patient")) {
        user.role.push("patient");
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
        sameSite: "lax",
        maxAge: 604800000,
      });

      return res.status(200).json({
        message: "Logged In Successfully as Patient",
        user: {
          id: patient.id,
          firstName: user.firstName,
          email: user.email,
          roles: user.role,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid role. Only 'doctor' and 'patient' are allowed." });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.Logout = async (req, res) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: false, sameSite: "lax" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: false, sameSite: "lax" });
  res.status(200).json({ message: "Logged out successfully" });
};
