const mongoose = require('mongoose');

// Schema for the medical report data
const medicalHistorySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Reference to the Patient model
    required: true,
  },
  templateTitle: {
    type: String,
    required: true,
  },
  fields: [
    {
      label: String,
      value: String,
    },
  ],
  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory;
