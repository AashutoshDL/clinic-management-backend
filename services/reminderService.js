const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const EmailReminder = require('../models/reminderModel');
const Appointment = require('../models/appointmentModel');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, 
  },
});


const reminderService = async (email, doctorName, patientName, appointmentTime, reminderTime, appointmentId) => {
  if (!email || !doctorName || !patientName || !appointmentTime || !reminderTime) {
    throw new Error("Email, doctor name, patient name, appointment time, and reminder time are required.");
  }

  const [hour, minute] = reminderTime.trim().split(':');

  if (
    isNaN(hour) || isNaN(minute) || 
    hour < 0 || hour > 23 || 
    minute < 0 || minute > 59
  ) {
    throw new Error('Invalid reminder time format. Hour should be between 0-23 and minute between 0-59.');
  }

  const cronExpression = `${minute} ${hour} * * *`;
  schedule.scheduleJob(cronExpression, async () => {
    try {

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Appointment Reminder Notification',
        text: `Reminder: You have an appointment scheduled with Dr. ${doctorName} at ${appointmentTime}.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Appointment Reminder</h2>
            <p>You have an upcoming appointment with <strong>Dr. ${doctorName}</strong> at <strong>${appointmentTime}</strong>.</p>
            <p><strong>Patient Name:</strong> ${patientName}</p>
            <p>This reminder was scheduled for ${reminderTime}.</p>
          </div>
        `,
      });

      console.log(`Appointment reminder email sent to ${email} at ${reminderTime}`);

      const result = await EmailReminder.updateOne(
        { appointmentId: appointmentId }, 
        { reminderStatus: 'Sent' }
      );

      if (result.nModified === 0) {
        console.log(`No reminder found for appointmentId: ${appointmentId}`);
      } else {
        console.log(`Reminder status updated for appointmentId: ${appointmentId}`);
      }

    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  });

  console.log(`Appointment reminder scheduled for ${email} at ${reminderTime}`);
};

module.exports = {
  reminderService,
};