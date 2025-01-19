const express = require('express');
const router = express.Router();
const {EmailReminder} = require('../controllers/emailReminderController'); // Import the controller

// Route to set a reminder (schedules daily reminder)
router.post('/emailReminder', EmailReminder);

module.exports = router;