const nodemailer = require('nodemailer');
const cron = require('node-cron'); // Import node-cron
const dayjs = require('dayjs'); // For time comparison

module.exports.reminderService = async (email, reminderMessage, reminderTime) => {
  if (!email || !reminderMessage || !reminderTime) {
    throw new Error("Email, reminder message, and reminder time are required");
  }

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
    subject: 'Daily Reminder',
    text: `Reminder Message: ${reminderMessage}`,
    html: `<h2>${reminderMessage}</h2>`,
  };

  // Use node-cron to schedule the task daily at the specified time
  cron.schedule(`0 ${reminderTime.split(':')[1]} ${reminderTime.split(':')[0]} * * *`, async () => {
    try {
      // Send email at the specified time every day
      await transporter.sendMail(mailOptions);
      console.log(`Reminder sent to ${email} at ${reminderTime}`);
    } catch (error) {
      console.error("Error sending the reminder:", error);
    }
  });
};
