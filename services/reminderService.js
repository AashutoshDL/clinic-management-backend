const schedule = require('node-schedule'); // Import node-schedule
const nodemailer = require('nodemailer');

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, // Use environment variables for security
  },
});

/**
 * Schedule and send a daily reminder email.
 * @param {string} email - The recipient's email address.
 * @param {string} reminderMessage - The reminder message to be sent.
 * @param {string} reminderTime - The time in HH:mm format.
 */
const reminderService = async (email, reminderMessage, reminderTime) => {
  if (!email || !reminderMessage || !reminderTime) {
    throw new Error("Email, reminder message, and reminder time are required");
  }

  const [hour, minute] = reminderTime.trim().split(':')

    if(
      isNaN(hour) || isNaN(minute) ||  hour < 0 || 
      hour > 23 || 
      minute < 0 || 
      minute > 59
    ) {
      console.log("Hour",hour)
      console.log("Minute",minute)
      throw new Error('Invalid reminder time format.');
    }


  // Schedule the daily email
  schedule.scheduleJob(`${minute} ${hour} * * *`, async () => {
    try {
      // Send the email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Daily Reminder',
        text: `Reminder Message: ${reminderMessage}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Your Daily Reminder</h2>
            <p>${reminderMessage}</p>
            <small>This reminder was scheduled for ${reminderTime}.</small>
          </div>
        `,
      });
      console.log(`Daily reminder email sent to ${email} at ${reminderTime}`);
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  });

  console.log(`Email reminder scheduled for ${email} at ${reminderTime}`);
};

// Export the reminderService function using module.exports
module.exports = {
  reminderService,
};