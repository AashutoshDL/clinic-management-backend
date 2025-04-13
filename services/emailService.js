const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports.sendVerificationEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const code = Math.floor(100000 + Math.random() * 900000);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <b>${code}</b></p>`,
  };

  try {

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
    return code;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
