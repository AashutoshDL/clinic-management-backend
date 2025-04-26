const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const EmailReminder = require('../models/reminderModel');
const Appointment = require('../models/appointmentModel');
const Patient = require('../models/patientModel');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const reminderService = async (appointmentId, reminderTime) => {
  if (!appointmentId || !reminderTime) {
    throw new Error("Missing required fields");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  const { doctorName, patientName, patientId, time: appointmentTime, date: appointmentDate } = appointment;

  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const email = patient.email;

  schedule.scheduleJob(reminderTime, async () => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Appointment Reminder Notification',
        text: `Reminder: You have an appointment scheduled with Dr. ${doctorName} at ${appointmentTime}.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Appointment Reminder</h2>
            <p>You have an upcoming appointment with <strong>Dr. ${doctorName}</strong> at <strong>${appointmentTime}</strong> on <strong>${appointmentDate}</strong>.</p>
            <p><strong>Patient Name:</strong> ${patientName}</p>
            <p>This reminder was sent at ${new Date().toLocaleTimeString()}.</p>
          </div>
        `,
      });

      console.log(`Reminder email sent to ${email} at ${new Date().toLocaleString()}`);

      const result = await EmailReminder.updateOne(
        { appointmentId },
        { reminderStatus: 'Sent' }
      );

      if (result.modifiedCount === 0) {
        console.log(`No reminder found to update for appointmentId: ${appointmentId}`);
      } else {
        console.log(`Reminder status updated for appointmentId: ${appointmentId}`);
      }

    } catch (error) {
      console.error("Error sending email:", error);
    }
  });

  console.log(`Reminder scheduled for ${email} at ${reminderTime.toLocaleString()}`);
};

const reschedulePendingReminders = async () => {
  try {
    const now = new Date();

    const pendingReminders = await EmailReminder.find({
      reminderStatus: 'Pending',
      reminderTime: { $gte: now },
    });

    console.log(`Found ${pendingReminders.length} pending reminders to reschedule.`);

    for (const reminder of pendingReminders) {
      await reminderService(reminder.appointmentId, reminder.reminderTime);
    }
  } catch (err) {
    console.error('Error rescheduling pending reminders:', err);
  }
};

module.exports = {
  reminderService,
  reschedulePendingReminders,
};
