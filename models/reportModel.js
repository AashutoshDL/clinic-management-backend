const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
});

const reportTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  customFields: [customFieldSchema],
});

module.exports = mongoose.model('ReportTemplate', reportTemplateSchema);
