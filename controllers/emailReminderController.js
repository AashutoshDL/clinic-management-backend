const { reminderService } = require('../services/emailService'); // Import email service

module.exports.EmailReminder = async (req, res) => {
  const { userId, reminderTime, reminderMessage } = req.body;

  if (!userId || !reminderTime || !reminderMessage) {
    return res.status(400).json({ message: "User ID, reminder time, and message are required." });
  }

  try {
    // Fetch the user's email from the database using userId
    const user = await user.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Schedule the reminder email
    await reminderService(user.email, reminderMessage, reminderTime);

    return res.status(200).json({ message: 'Daily reminder email scheduled successfully.' });
  } catch (error) {
    console.error('Error setting reminder:', error);
    return res.status(500).json({ message: 'Failed to set reminder.' });
  }
};
