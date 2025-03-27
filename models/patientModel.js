const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: [String],
    enum: ['user', 'patient', 'doctor', 'lab-technician', 'admin', 'superadmin'],
  },
  accountCreated: {
    type: String,
  },

  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  height: {
    type: Number, // Assuming height is stored in cm or inches
  },
  heightUnit: {
    type: String,
    enum: ['cm', 'inch'],
    default: 'cm',
  },
  weight: {
    type: Number, // Assuming weight is stored in kg or lbs
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg',
  },
  systolicBP: {
    type: Number, // Blood Pressure (Systolic)
  },
  diastolicBP: {
    type: Number, // Blood Pressure (Diastolic)
  },
  heartRate: {
    type: Number, // Heart Rate (BPM)
  },
  temperature: {
    type: Number, // Body Temperature
  },
  temperatureUnit: {
    type: String,
    enum: ['C', 'F'],
    default: 'C',
  },
  bloodGlucose: {
    type: Number, // Blood Glucose Level
  },
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;