const reminderService = require('../services/reminderService');
const Patient = require('../models/patientModel');
const EmailReminder = require('../models/reminderModel');
const schedule = require('node-schedule');
const Appointment = require('../models/appointmentModel');
const dayjs = require('dayjs');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');


module.exports.getAllReminders = async (req, res) => {
  try {

    const reminders = await EmailReminder.find();

    if (!reminders || reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found.' });
    }

    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching all reminders:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};


module.exports.getReminderByPatientId = async (req, res) => {
  const { patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ message: 'Invalid patient ID format.' });
  }

  try {

    const reminders = await EmailReminder.find({ patientId });

    if (!reminders || reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found for this patient.' });
    }

    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by patient ID:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};


module.exports.EmailReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const { patientId, patientName, doctorName, time, date } = appointment;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientEmail = patient.email;

    const existingReminder = await EmailReminder.findOne({ appointmentId: id });
    if (existingReminder) {
      return res.status(400).json({ message: "Reminder already set for this appointment" });
    }

    
    let appointmentDate = dayjs(date, 'YYYY-MM-DD');
    if (!appointmentDate.isValid()) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }
    appointmentDate = appointmentDate.toDate();  
    
    const startTimeString = time.split(" - ")[0];
    const [hours, minutes] = startTimeString.split(":").map(Number);
    const reminderTime = new Date(appointmentDate);
    reminderTime.setHours(hours, minutes + 5, 0, 0);  

    console.log("Reminder time",reminderTime)

    const newEmailReminder = new EmailReminder({
      appointmentId: id,
      email: patientEmail,
      doctorName,
      appointmentDate,
      appointmentTime: time,
      patientName,
      patientId,
      reminderTime,
    });

    await newEmailReminder.save();
    
    console.log(reminderTime)
    await reminderService.reminderService(
      id,
      reminderTime
    );

    res.json({ message: "Reminder set successfully", reminderTime});
    
  } catch (error) {
    console.error("Error setting email reminder:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports.cancelReminder = async (req, res) => {
  const { id } = req.params; 
  const { reminderTime, reminderMessage } = req.body;

  try {

    const reminders = await EmailReminder.find({
      userId: id,
      reminderTime,
      reminderMessage,
    });

    if (reminders.length === 0) {
      return res.status(404).json({ message: 'Reminder not found or already cancelled.' });
    }

    for (let reminder of reminders) {
      if (reminder.jobId && schedule.scheduledJobs[reminder.jobId]) {
        schedule.scheduledJobs[reminder.jobId].cancel();
        console.log(`Cancelled reminder job ID: ${reminder.jobId}`);
      } else {
        console.log("No scheduled job found for cancellation.");
      }

      await EmailReminder.findByIdAndDelete(reminder._id);
    }

    return res.status(200).json({ message: 'Reminder(s) cancelled successfully.' });
  } catch (error) {
    console.error('Error canceling reminder:', error);
    return res.status(500).json({ message: 'Failed to cancel reminder.' });
  }
};


// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// module.exports.testEmail = async (req, res) => {
//   try {
//     const { to } = req.body;

//     if (!to) {
//       return res.status(400).json({ message: "Recipient email ('to') is required." });
//     }

//     const sendTime = new Date(Date.now() + 60000); // 1 minute from now

//     schedule.scheduleJob(sendTime, async () => {
//       try {
//         await transporter.sendMail({
//           from: process.env.EMAIL,
//           to,
//           subject: '🔔 Test Appointment Reminder',
//           html: `
//             <h2>Test Email Reminder</h2>
//             <p>This is a <strong>test email</strong> scheduled at ${new Date().toLocaleString()}.</p>
//             <p>If you're reading this, scheduling works!</p>
//           `,
//         });

//         console.log(`✅ Test email sent to ${to} at ${new Date().toLocaleString()}`);
//       } catch (err) {
//         console.error("❌ Error sending test email:", err);
//       }
//     });

//     res.json({
//       message: `✅ Test email scheduled to be sent to ${to} at ${sendTime.toLocaleTimeString()}`,
//     });

//   } catch (error) {
//     console.error("❌ Error in testEmail:", error);
//     res.status(500).json({ message: "Server error in test email" });
//   }
// };  