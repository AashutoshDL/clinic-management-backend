const express = require('express');
const router = express.Router();
const {EmailReminder,cancelReminder,getAllReminders} = require('../controllers/emailReminderController'); // Import the controller

// Route to set a reminder (schedules daily reminder)
router.post('/emailReminder/:id', EmailReminder);
router.get('/getAllReminders/:id', getAllReminders);
router.post('/cancelReminder/:id',cancelReminder );

module.exports = router;