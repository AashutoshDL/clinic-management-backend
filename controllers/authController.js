  //this is the code that handeled the authentication and authorization of the user
  const dayjs = require("dayjs");
  const bcrypt = require("bcrypt");
  require("dotenv").config();
  const jwt = require("jsonwebtoken");
  const { sendVerificationEmail } = require("../services/emailService");
  const Doctor = require("../models/doctorModel");
  const Patient = require("../models/patientModel");
  const Admin = require("../models/adminModel");
  const User = require("../models/userModel");
  const Superadmin=require("../models/superAdminModel")
  const {createTokens,setTokensInCookies} = require("../tokens/tokensController")

  const SALT_ROUNDS = 10;
  
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

  // Helper function to create the role if it doesn't exist
const createRoleIfNotExist = async (role, user) => {
  let roleInstance;

  // Check for each role type and create if it doesn't exist
  if (role === "doctor") {
    roleInstance = await Doctor.findOne({ email: user.email });
    if (!roleInstance) {
      roleInstance = new Doctor({
        name: user.name,
        userName: user.userName,
        password: user.password,
        email: user.email,
        role: role,
      });
      await roleInstance.save();
    }
  } else if (role === "patient") {
    roleInstance = await Patient.findOne({ email: user.email });
    if (!roleInstance) {
      roleInstance = new Patient({
        name: user.name,
        userName: user.userName,
        password: user.password,
        email: user.email,
        role: role,
      });
      await roleInstance.save();
    }
  } else if (role === "admin") {
    roleInstance = await Admin.findOne({ email: user.email });
    if (!roleInstance) {
      roleInstance = new Admin({
        name: user.name,
        userName: user.userName,
        password: user.password,
        email: user.email,
        role: role,
      });
      await roleInstance.save();
    }
  } else {
    throw new Error("Invalid role."); 
  }

  return roleInstance;
};

  module.exports.Login = async (req, res) => {
    const { email, password, role } = req.body;
  
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }
  
    try {
      // Check if the provided credentials match the superadmin
      const superadmin = await Superadmin.findOne({ email });
      let userData = null;
  
      if (superadmin) {
        const isSuperadminPasswordCorrect = await bcrypt.compare(password, superadmin.password);
  
        if (isSuperadminPasswordCorrect) {
          // If superadmin login is successful, set the role as superadmin
          userData = { email, password, role: ["superadmin"] };
        } else {
          return res.status(400).json({ message: "Invalid password." });
        }
      } else {
        // Check if the user exists as a normal user
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "No user found with this email." });
        }
  
        // Validate the password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return res.status(400).json({ message: "Invalid password." });
        }
  
        // Check if the user is a superadmin and update roles if necessary
        if (superadmin && !user.role.includes("superadmin")) {
          user.role.push("superadmin");
          await user.save(); // Save updated role array
        }
  
        // Helper function to create the role if it doesn't exist
        let roleInstance = await createRoleIfNotExist(role, user);
  
        // Use the role instance for the tokens instead of user data
        userData = {
          _id: roleInstance._id,
          email: user.email,
          role: roleInstance.role,
        };
      }
  
      // Generate JWT tokens with roleInstance ID
      const { accessToken } = createTokens(userData);
  
      // Set tokens in cookies
      setTokensInCookies(res, accessToken);
  
      // Respond with success message and user details
      return res.status(200).json({
        message: `Logged In Successfully as ${userData.role[0].charAt(0).toUpperCase() + userData.role[0].slice(1)}`,
        user: {
          id: userData._id,
          email: userData.email,
          roles: userData.role, 
        },
      });
  
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  
  module.exports.Logout = async (req, res) => {
    res.clearCookie("accessToken", { httpOnly: true, secure: false, sameSite: "lax" });
    res.status(200).json({ message: "Logged out successfully" });
  };