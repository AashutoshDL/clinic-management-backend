const express = require('express');
const router = express.Router();
const {EmailReminder,cancelReminder,getReminderByPatientId,getAllReminders} = require('../controllers/emailReminderController'); // Import the controller

// Route to set a reminder (schedules daily reminder)
router.post('/emailReminder/:id', EmailReminder);
router.get('/getReminderByPatientId/:patientId', getReminderByPatientId);
router.post('/cancelReminder/:id',cancelReminder );
router.get('/getAllReminders',getAllReminders);

module.exports = router;