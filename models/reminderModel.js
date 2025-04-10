const mongoose = require('mongoose');

const emailReminderSchema = new mongoose.Schema({
  reminderMessage: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  patientId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Patient',
  },
  patientName: {
    type: String,
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
  reminderTime: {
    type: Date,
    required: true,
  },
  reminderStatus: {
    type: String,
    default: 'Pending',
  },
});

const EmailReminder = mongoose.model("EmailReminder", emailReminderSchema);

module.exports = EmailReminder;
