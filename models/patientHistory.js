const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  hospitalName: {
    type: String,
    required: true,
  },
  diseases: {
    type: [String],
    required: true,
  },
  medicines: {
    type: [String],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('PatientHistory', historySchema);
