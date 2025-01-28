const { reminderService } = require('../services/reminderService'); // Import email service
const User = require('../models/userModel');
const EmailReminder = require('../models/reminderModel');
const schedule = require('node-schedule'); // Import node-schedule for scheduling jobs

// Get all reminders API
module.exports.getAllReminders = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch all reminders for the given userId
    const reminders = await EmailReminder.find({ userId: id });

    if (reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found for this user.' });
    }
    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }  
} 

// API to set reminder
module.exports.EmailReminder = async (req, res) => {
  // Fetch the necessary data from the parameters and body
  const { id } = req.params;
  const { reminderTime, reminderMessage } = req.body;

  // Check if the data is fetched properly, else display an error message
  if (!reminderTime || !reminderMessage) {
    return res.status(400).json({ message: "User ID, reminder time, and message are required." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newEmailReminder = new EmailReminder({
      userId: id,
      reminderTime,
      reminderMessage,
      email: user.email,
    });

    await newEmailReminder.save(); // Save the data in the database

    // Schedule the reminder email using node-schedule
    const reminderJob = schedule.scheduleJob(reminderTime, async () => {
      await reminderService(user.email, reminderMessage);
    });

    // Store the job ID in the database for later cancellation
    newEmailReminder.jobId = reminderJob.id;
    await newEmailReminder.save();

    return res.status(200).json({ message: 'Daily reminder email scheduled successfully.' });
  } catch (error) {
    console.error('Error setting reminder:', error);
    return res.status(500).json({ message: 'Failed to set reminder.' });
  }
};

// Cancel or delete reminder (using userId, reminderTime, and reminderMessage)
module.exports.cancelReminder = async (req, res) => {
  const { id } = req.params;
  const { reminderTime, reminderMessage } = req.body;  // Get reminder details from the request body

  try {
    // Find the reminder in the database using userId, reminderTime, and reminderMessage
    const reminder = await EmailReminder.findOne({
      userId: id,
      reminderTime,
      reminderMessage
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found or already cancelled.' });
    }

    // If the reminder is found, cancel the scheduled job
    if (schedule.scheduledJobs[reminder.jobId]) {
      schedule.scheduledJobs[reminder.jobId].cancel();
      console.log(`Reminder job with ID ${reminder.jobId} has been cancelled.`);
    }

    // Remove the reminder from the database
    await EmailReminder.findByIdAndDelete(reminder._id);

    return res.status(200).json({ message: 'Reminder cancelled successfully' });
  } catch (error) {
    console.error('Error canceling reminder:', error);
    return res.status(500).json({ message: 'Failed to cancel reminder.' });
  }
};
