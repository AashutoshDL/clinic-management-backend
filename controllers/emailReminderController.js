const { reminderService } = require('../services/reminderService');
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const Admin = require('../models/adminModel');
const EmailReminder = require('../models/reminderModel');
const schedule = require('node-schedule');

// Get all reminders for a user
module.exports.getAllReminders = async (req, res) => {
  const { id } = req.params;
  try {
    const reminders = await EmailReminder.find({ userId: id });

    if (reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found for this user.' });
    }
    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};

module.exports.EmailReminder = async (req, res) => {
  const { id } = req.params;
  const { reminderTime, reminderMessage, role } = req.body;

  if (!reminderTime || !reminderMessage || !role || !Array.isArray(role) || role.length === 0) {
    return res.status(400).json({ message: "Role, reminder time, and message are required." });
  }

  // Get the first role from the array
  const userRole = role[0];

  try {
    let user;
    if (userRole === 'doctor') {
      user = await Doctor.findById(id);
    } else if (userRole === 'patient') {
      user = await Patient.findById(id);
    } else if (userRole === 'admin') {
      user = await Admin.findById(id);
    } else {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (!user) {
      return res.status(404).json({ message: `${userRole} not found` });
    }

    // Create a new email reminder
    const newEmailReminder = new EmailReminder({
      userId: id,
      reminderTime,
      reminderMessage,
      email: user.email,
    });

    // Save the reminder
    await newEmailReminder.save();

    // Schedule the email reminder job
    const reminderJob = schedule.scheduleJob(reminderTime, async () => {
      await reminderService(user.email, reminderMessage, reminderTime);
    });

    // Store the job ID in the reminder document (for cancellation later)
    newEmailReminder.jobId = reminderJob.name;
    await newEmailReminder.save();

    return res.status(200).json({ message: 'Reminder scheduled successfully.' });
  } catch (error) {
    console.error('Error setting reminder:', error);
    return res.status(500).json({ message: 'Failed to set reminder.' });
  }
};


// Cancel reminder(s) for a user
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
