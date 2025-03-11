const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsById } = require('../controllers/Appointment/appointmentController');

// Create an appointment
router.post('/createAppointment/:id', createAppointment);
router.get('/getAppointmentsById/:id', getAppointmentsById);

module.exports = router;