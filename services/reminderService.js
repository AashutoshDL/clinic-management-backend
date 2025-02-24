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
 * Schedule and send a reminder email at a specific time.
 * @param {string} email - The recipient's email address.
 * @param {string} reminderMessage - The reminder message to be sent.
 * @param {string} reminderTime - The time in HH:mm format.
 */
const reminderService = async (email, reminderMessage, reminderTime) => {
  if (!email || !reminderMessage || !reminderTime) {
    throw new Error("Email, reminder message, and reminder time are required.");
  }

  const [hour, minute] = reminderTime.trim().split(':');

  if (
    isNaN(hour) || isNaN(minute) || 
    hour < 0 || hour > 23 || 
    minute < 0 || minute > 59
  ) {
    throw new Error('Invalid reminder time format. Hour should be between 0-23 and minute between 0-59.');
  }

  // Schedule the reminder email at the specified time
  const cronExpression = `${minute} ${hour} * * *`; // Cron format for scheduling
  schedule.scheduleJob(cronExpression, async () => {
    try {
      // Send the reminder email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Reminder Notification',
        text: `Reminder: ${reminderMessage}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Your Reminder</h2>
            <p>${reminderMessage}</p>
            <small>This reminder was scheduled for ${reminderTime}.</small>
          </div>
        `,
      });

      console.log(`Reminder email sent to ${email} at ${reminderTime}`);
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  });

  console.log(`Email reminder scheduled for ${email} at ${reminderTime}`);
};

// Export the reminderService function
module.exports = {
  reminderService,
};
