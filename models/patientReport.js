const mongoose = require('mongoose');

const patientReportSchema = new mongoose.Schema({
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

const PatientReport = mongoose.model('PatientReport', patientReportSchema);

module.exports = PatientReport;
