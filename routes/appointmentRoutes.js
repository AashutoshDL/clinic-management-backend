const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsById, confirmAppointment } = require('../controllers/Appointment/appointmentController');

// Create an appointment
router.post('/createAppointment/:id', createAppointment);
router.get('/getAppointmentsById/:id', getAppointmentsById);
router.patch('/confirmAppointment/:id',confirmAppointment);

module.exports = router;