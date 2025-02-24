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
    enum: ['doctor', 'admin', 'lab-technician'],
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
      required: false, // Optional, if the doctor has duty hours
    },
    to: {
      type: String,
      required: false, // Optional, if the doctor has duty hours
    },
  },
  availableTimes: [{
    from: {
      type: String, // Time format (e.g., "9:00 AM")
      required: true,
    },
    to: {
      type: String, // Time format (e.g., "11:00 AM")
      required: true,
    },
  }],
  profilePicture: {
    type: String, // URL or path to doctor's profile image
    required: false,
  },
  experience: {
    type: String, // Doctor's years of experience or specific expertise
    required: false,
  },
  qualifications: {
    type: [String], // List of qualifications or degrees the doctor has
    required: false,
  },
  clinic: {
    name: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    contactNumber: {
      type: String,
      required: false,
    },
  },
  reviews: [{
    patientName: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    comment: {
      type: String,
      required: false,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
  }],
  accountCreated: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: false, // By default, the doctor is available
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
