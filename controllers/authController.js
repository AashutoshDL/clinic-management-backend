  const dayjs = require("dayjs");
  const bcrypt = require("bcrypt");
  require("dotenv").config();
  const jwt = require("jsonwebtoken");
  const { sendVerificationEmail } = require("../services/emailService");
  const Doctor = require("../models/doctorModel");
  const Patient = require("../models/patientModel");
  const Admin = require("../models/adminModel");
  const User = require("../models/userModel");

  const SALT_ROUNDS = 10;

  const createTokens = (user) => {
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // Added role to the payload
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
  
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // Added role to the payload
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  
    return { accessToken, refreshToken };
  };
  

  const setTokensInCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // Set to `true` in production with HTTPS
      sameSite: "lax",
      maxAge: 3600000, // 1 hour
    });
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to `true` in production with HTTPS
      sameSite: "lax",
      maxAge: 604800000, // 7 days
    });
  };
  
  module.exports.Register = async (req, res) => {
    const { name, userName, email, password, acceptedTerms } = req.body;
  
    if (!name || !email || !password || !acceptedTerms || !userName) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    try {
      // Check if a user already exists with the same role
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
  
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      const verificationCode = await sendVerificationEmail(email);
  
      // Save the user to the User collection
      const newUser = new User({
        name,
        userName,
        email,
        password: hashedPassword,
        acceptedTerms,
        verificationCode,
        verificationExpires: Date.now() + 3600000,
        accountCreated: dayjs().format("MMMM D, YYYY h:mm A"),
      })
      await newUser.save();
  
      res.status(201).json({ message: `Please verify your email.` });
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
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: `No user found with email ${email}.` });
      }

      if (user.verificationCode !== verificationCode) {
        setTimeout(async () => {
          const userToDelete = await User.findOne({ email });
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


  module.exports.refreshToken = async(req,res)=>{
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
  
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const newAccessToken = jwt.sign(
        { id: payload.id, name: payload.name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
  
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Invalid refresh token:', error.message);
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  module.exports.Login = async (req, res) => {
    const { email, password, role } = req.body;
  
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "No user found with this email." });
      }
  
      // Validate the password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid password." });
      }
  
      // Helper function to create the role if it doesn't exist
      const createRoleIfNotExist = async (role, user) => {
        let roleInstance;
        if (role === "doctor") {
          roleInstance = await Doctor.findOne({ email });
          if (!roleInstance) {
            roleInstance = new Doctor({
              name: user.name,
              userName: user.userName,
              password:user.password,
              email: user.email,
              role: role,
            });
            await roleInstance.save();
          }
        } else if (role === "patient") {
          roleInstance = await Patient.findOne({ email });
          if (!roleInstance) {
            roleInstance = new Patient({
              name: user.name,
              userName: user.userName,
              password:user.password,
              email: user.email,
              role: role,
            });
            await roleInstance.save();
          }
        } else if (role === "admin") {
          roleInstance = await Admin.findOne({ email });
          if (!roleInstance) {
            roleInstance = new Admin({
              email: user.email,
              password: user.password,
              role: role,
            });
            await roleInstance.save();
          }
        } else {
          throw new Error("Invalid role.");
        }
        return roleInstance;
      };
  
      // Create role if it doesn't exist
      let roleInstance = await createRoleIfNotExist(role, user);
  
      // Add the new role to the user's roles array and save
      if (!user.role.includes(role)) {
        user.role.push(role);
        await user.save();
      }
  
      // Generate JWT tokens with roleInstance ID instead of user ID
      const { accessToken, refreshToken } = createTokens({
        _id: roleInstance._id, // Use the ID of the logged-in role instance
        email: user.email,
        role: roleInstance.role, // Use role-specific info
      });
  
      // Set tokens in cookies
      setTokensInCookies(res, accessToken, refreshToken);
  
      // Respond with success message and user details
      return res.status(200).json({
        message: `Logged In Successfully as ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        user: {
          id: roleInstance._id, // Send the correct object ID based on the role
          name: roleInstance.name,
          email: roleInstance.email,
          roles: roleInstance.role,
        },
      });
  
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

  
