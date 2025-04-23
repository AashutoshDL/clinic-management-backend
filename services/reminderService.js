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

  // Convert reminderTime to a Date object
  const reminderDate = new Date(reminderTime);
  if (isNaN(reminderDate)) {
    throw new Error("Invalid reminder time");
  }

  // Fetch the appointment details
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const {
    doctorName,
    patientName,
    patientId,
    time: appointmentTime,
    date: appointmentDate,
  } = appointment;

  // Fetch patient email from Patient model
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new Error("Patient not found");
  }

  const email = patient.email;

  // Schedule the reminder email at the correct time
  schedule.scheduleJob(reminderDate, async () => {
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

      // Update reminder status in the EmailReminder model
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

  console.log(`Reminder scheduled for ${email} at ${reminderDate.toLocaleString()}`);
};

module.exports = {
  reminderService,
};