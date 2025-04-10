const reminderService = require('../services/reminderService');
const Patient = require('../models/patientModel');
const EmailReminder = require('../models/reminderModel');
const schedule = require('node-schedule');
const Appointment = require('../models/appointmentModel');
const dayjs = require('dayjs');
const mongoose = require('mongoose');

module.exports.getAllReminders = async (req, res) => {
  try {
    // Fetch all reminders
    const reminders = await EmailReminder.find();

    // If no reminders found, return a 404
    if (!reminders || reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found.' });
    }

    // Return the found reminders
    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching all reminders:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};


module.exports.getReminderByPatientId = async (req, res) => {
  const { patientId } = req.params;

  // Validate that the patientId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ message: 'Invalid patient ID format.' });
  }

  try {
    // Fetch the reminders for the patient by their patientId
    const reminders = await EmailReminder.find({ patientId });

    // If no reminders found, return a 404
    if (!reminders || reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found for this patient.' });
    }

    // Return the found reminders
    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by patient ID:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};


module.exports.EmailReminder = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the appointment first
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const { patientId, patientName, doctorName, time, date } = appointment;

    // Fetch the patient details
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientEmail = patient.email;

    // Check if a reminder already exists for this appointment
    const existingReminder = await EmailReminder.findOne({ appointmentId: id });
    if (existingReminder) {
      return res.status(400).json({ message: "Reminder already set for this appointment" });
    }

    // Calculate reminder time
    const startTimeString = time.split(" - ")[0];
    const [hours, minutes] = startTimeString.split(":").map(Number);
    let reminderTime = new Date();
    reminderTime.setHours(hours, minutes - 5, 0, 0);  // Set reminder 5 minutes before the appointment

    let appointmentDate = dayjs(date, 'YYYY-MM-DD');
    if (!appointmentDate.isValid()) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }
    appointmentDate = appointmentDate.toDate();  // Convert appointment date to Date object

    // Create the reminder
    const newEmailReminder = new EmailReminder({
      appointmentId: id,
      email: patientEmail,
      doctorName,
      appointmentDate,
      appointmentTime: time,
      patientName,
      patientId: patientId,
      reminderTime,
    });

    await newEmailReminder.save();  // Save the reminder

    // You can trigger the reminder service here if necessary
    const reminderTimeString = dayjs(reminderTime).format('HH:mm');

    await reminderService.reminderService(
      patientEmail, 
      doctorName, 
      patientName, 
      time, 
      reminderTimeString,
      id
    );

    res.json({ message: "Reminder set successfully", reminderTime: reminderTimeString });
    
  } catch (error) {
    console.error("Error setting email reminder:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports.cancelReminder = async (req, res) => {
  const { id } = req.params; // userId
  const { reminderTime, reminderMessage } = req.body;

  try {
    // Find the reminders by userId and optional filter criteria (time/message)
    const reminders = await EmailReminder.find({
      userId: id,
      reminderTime,
      reminderMessage,
    });

    if (reminders.length === 0) {
      return res.status(404).json({ message: 'Reminder not found or already cancelled.' });
    }

    // Cancel the scheduled job(s)
    for (let reminder of reminders) {
      if (reminder.jobId && schedule.scheduledJobs[reminder.jobId]) {
        schedule.scheduledJobs[reminder.jobId].cancel();
        console.log(`Cancelled reminder job ID: ${reminder.jobId}`);
      } else {
        console.log("No scheduled job found for cancellation.");
      }

      // Delete the reminder from the database
      await EmailReminder.findByIdAndDelete(reminder._id);
    }

    return res.status(200).json({ message: 'Reminder(s) cancelled successfully.' });
  } catch (error) {
    console.error('Error canceling reminder:', error);
    return res.status(500).json({ message: 'Failed to cancel reminder.' });
  }
};