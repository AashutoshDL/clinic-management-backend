const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure the email is unique
  },
  role:{
    type:String,
    required:true,
  },
  specialization: {
    type: String,
    required: false,
    trim: true,
  },
  info: {
    type: String,
    required: false,
    trim: true,
  },
  dutyTime: {
    from: {
      type: String,
      required: false, // Optional, if the doctor has duty hours
    },
    to: {
      type: String,
      required: false, // Optional, if the doctor has duty hours
    },
  },
  availableTimes: {
    type: [String], // Array of strings representing available times (e.g. "9:00 AM", "11:00 AM")
    required: false,
  },
  accountCreated:{
    type:String,
  }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
