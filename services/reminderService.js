const schedule = require('node-schedule');
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
 * Schedule and send a reminder email for an appointment at a specific time.
 * @param {string} email - The recipient's email address (doctor or patient).
 * @param {string} doctorName - The doctor's name.
 * @param {string} patientName - The patient's name.
 * @param {string} appointmentTime - The time of the appointment.
 * @param {string} reminderTime - The time in HH:mm format to send the reminder.
 */
const reminderService = async (email, doctorName, patientName, time, reminderTime) => {
  if (!email || !doctorName || !patientName || !time || !reminderTime) {
    throw new Error("Email, doctor name, patient name, appointment time, reminder message, and reminder time are required.");
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
  const cronExpression = `${minute} ${hour} * * *`;
  schedule.scheduleJob(cronExpression, async () => {
    try {
      // Send the reminder email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Appointment Reminder Notification',
        text: `
          Reminder: You have an appointment scheduled with Dr. ${doctorName} at ${appointmentTime}.
        `,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Appointment Reminder</h2>
            <p>You have an upcoming appointment with <strong>Dr. ${doctorName}</strong> at <strong>${appointmentTime}</strong>.</p>
            <p><strong>Patient Name:</strong> ${patientName}</p>
            <p>${reminderMessage}</p>
            <small>This reminder was scheduled for ${reminderTime}.</small>
          </div>
        `,
      });

      console.log(`Appointment reminder email sent to ${email} at ${reminderTime}`);
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  });

  console.log(`Appointment reminder scheduled for ${email} at ${reminderTime}`);
};

module.exports = {
  reminderService,
};
