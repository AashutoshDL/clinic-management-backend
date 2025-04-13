const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsById,getAllAppointments, confirmAppointment,cancelAppointmentById} = require('../controllers/Appointment/appointmentController');

router.get('/getAllAppointments',getAllAppointments)
router.post('/createAppointment/:id', createAppointment);
router.get('/getAppointmentsById/:id', getAppointmentsById);
router.patch('/confirmAppointment/:id',confirmAppointment);
router.delete('/cancelAppointmentById/:id',cancelAppointmentById)

module.exports = router;