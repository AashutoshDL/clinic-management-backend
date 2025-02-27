const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required:true },
  value: { type: String },
});

const reportTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  customFields: [customFieldSchema],
});

module.exports = mongoose.model('ReportTemplate', reportTemplateSchema);
