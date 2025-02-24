// models/appointmentModel.js

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the doctor is also stored in the 'User' model
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the patient is also stored in the 'User' model
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  time: {
    type: String, // Store the selected time as a string (e.g., "10:00 AM - 11:00 AM")
    required: true,
  },
  status: {
    type: String,
    default: 'Scheduled', // Default status is 'Scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
