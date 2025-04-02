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
    const { name, userName, email, password, acceptedTerms, role } = req.body;

    if (!name || !email || !password || !acceptedTerms || !userName || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const existingUser = await Promise.any([
            User.findOne({ email }),
            Doctor.findOne({ email }),
            Patient.findOne({ email }),
            Admin.findOne({ email }),
            Superadmin.findOne({ email }),
        ]).catch(() => null);

        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email in another role." });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const verificationCode = await sendVerificationEmail(email);

        console.log("Verification Code returned in register",verificationCode)

        let RoleModel;
        switch (role) {
            case "superadmin":
                RoleModel = Superadmin;
                break;
            case "doctor":
                RoleModel = Doctor;
                break;
            case "patient":
                RoleModel = Patient;
                break;
            case "admin":
                RoleModel = Admin;
                break;
            case "user":
                RoleModel = User;
                break;
            default:
                return res.status(400).json({ message: "Invalid role provided." });
        }

        const newUser = new RoleModel({ // Use RoleModel to save to the correct collection
            name,
            userName,
            email,
            password: hashedPassword,
            acceptedTerms,
            verificationCode,
            verificationExpires: Date.now() + 3600000,
            accountCreated: dayjs().format("MMMM D, YYYY h:mm A"),
            role
        });

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
      // Search for user across all models sequentially
      let user = await User.findOne({ email }) ||
                 await Doctor.findOne({ email }) ||
                 await Patient.findOne({ email }) ||
                 await Admin.findOne({ email }) ||
                 await Superadmin.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: `No user found with email ${email}` });
      }

      // Ensure verificationCode comparison is done as a string
      if (String(user.verificationCode) !== String(verificationCode)) {
          console.log(`Mismatch detected for email ${email}: Expected "${String(user.verificationCode)}", received "${String(verificationCode)}"`);

          // Schedule deletion after 5 minutes
          setTimeout(async () => {
              const freshUser = await user.constructor.findOne({ email });

              if (freshUser && String(freshUser.verificationCode) !== String(verificationCode) && !freshUser.isVerified) {
                  let RoleModel;

                  // Identify the user role using switch-case
                  switch (freshUser.constructor.modelName) {
                      case "Doctor":
                          RoleModel = Doctor;
                          break;
                      case "Patient":
                          RoleModel = Patient;
                          break;
                      case "Admin":
                          RoleModel = Admin;
                          break;
                      case "Superadmin":
                          RoleModel = Superadmin;
                          break;
                      default:
                          console.error("Could not determine RoleModel for user to delete");
                          return;
                  }

                  await RoleModel.deleteOne({ email });
                  console.log(`User with email ${email} deleted due to invalid verification code.`);
              }
          }, 5 * 60 * 1000);

          return res.status(400).json({
              message: "Invalid verification code",
          });
      }

      // Mark the user as verified
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();

      console.log(`Email ${email} successfully verified.`);

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
      let userData = null;
      let RoleModel;

      switch (role) {
          case "superadmin":
              RoleModel = Superadmin;
              break;
          case "doctor":
              RoleModel = Doctor;
              break;
          case "patient":
              RoleModel = Patient;
              break;
          case "admin":
              RoleModel = Admin;
              break;
          default:
              return res.status(400).json({ message: "Invalid role provided." });
      }

      const roleInstance = await RoleModel.findOne({ email });

      if (!roleInstance) {
          return res.status(404).json({ message: `No ${role} user found with this email.` });
      }

      // // Debugging logs:
    //   console.log("Password from request:", password);
    //   console.log("Hashed password from database:", roleInstance.password);

      if (!roleInstance.password) { // Check if the password exists
          console.error("Error: Hashed password is not present in the database for this user.");
          return res.status(500).json({ message: "Internal Server Error: Password not found." });
      }

      const isPasswordCorrect = await bcrypt.compare(password, roleInstance.password);

      if (!isPasswordCorrect) {
          return res.status(400).json({ message: "Invalid password." });
      }

      userData = { _id: roleInstance._id, email: roleInstance.email, role: [role] };

      // Generate JWT tokens with userData
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