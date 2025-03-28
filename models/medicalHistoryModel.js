const mongoose = require('mongoose');

// Schema for the medical report fields
const medicalHistorySchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  templateTitle: {
    type: String,
    required: true,
  },
  fields: [
    {
      label: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
  ],
  reportDate: {
    type: Date,
    default: Date.now,
  },
});

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory;
