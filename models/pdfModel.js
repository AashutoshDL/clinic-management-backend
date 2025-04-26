const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  summary : {
    type: String,
    default: null,
  },
  fileSize: {
    type: Number,
    required: true,
  },
});

const PDF = mongoose.model('pdf', pdfSchema);

module.exports = PDF;
