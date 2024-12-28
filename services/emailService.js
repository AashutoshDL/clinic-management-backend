const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports.sendVerificationEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  // Generate verification code
  const code = Math.floor(100000 + Math.random() * 900000);

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <b>${code}</b></p>`,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
    return code; // Return the verification code for further use
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
