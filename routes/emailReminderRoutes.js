const express = require('express');
const router = express.Router();
const {EmailReminder,cancelReminder,getReminderByPatientId,getAllReminders, testEmail, testInvoice} = require('../controllers/emailReminderController'); 

router.post('/emailReminder/:id', EmailReminder);
router.get('/getReminderByPatientId/:patientId', getReminderByPatientId);
router.post('/cancelReminder/:id',cancelReminder );
router.get('/getAllReminders',getAllReminders);
router.post('/testReminder',testEmail);
router.post('/testInvoice',testInvoice);

module.exports = router;