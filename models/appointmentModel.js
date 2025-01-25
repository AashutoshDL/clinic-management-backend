// const mongoose = require('mongoose');

// const appointmentSchema = new mongoose.Schema(
//   {
//     doctor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User', // Assuming User model has doctor and patient roles
//       required: true,
//     },
//     patient: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     appointmentDate: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ['Scheduled', 'Completed', 'Cancelled'],
//       default: 'Scheduled',
//     },
//   },
//   { timestamps: true }
// );

// const Appointment = mongoose.model('Appointment', appointmentSchema);
// module.exports = Appointment;
