  const mongoose = require('mongoose');

  const doctorSchema = new mongoose.Schema({
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['doctor'],
    },
    specialization: {
      type: String,
      trim: false,
    },
    information: {
      type: String,
      required: false,
      trim: true,
    },
    dutyTime: {
      from: {
        type: String,
        required: false,
      },
      to: {
        type: String,
        required: false,
      },
    },
    availableTimes: [{
      from: {
        type: String, 
        required: true,
      },
      to: {
        type: String, 
        required: true,
      },
    }],
    profilePicture: {
      type: String,
      required: false,
    },
    experience: {
      type: String,
      required: false,
    },
    qualifications: {
      type: [String], 
      required: false,
    },
    accountCreated: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: true, 
  });

  const Doctor = mongoose.model('Doctor', doctorSchema);

  module.exports = Doctor;
