const { ProfilingLevel } = require("mongodb");
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profileImage:{
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: [String],
    enum: ['patient'],
  },
  accountCreated: {
    type: String,
  },
  age:{
    type:Number,
  },
  gender:{
    type:String,
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  height: {
    type: Number, 
  },
  heightUnit: {
    type: String,
    enum: ['cm', 'inch'],
    default: 'cm',
  },
  weight: {
    type: Number, 
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg',
  },
  systolicBP: {
    type: Number, 
  },
  diastolicBP: {
    type: Number, 
  },
  heartRate: {
    type: Number, 
  },
  temperature: {
    type: Number, 
  },
  temperatureUnit: {
    type: String,
    enum: ['C', 'F'],
    default: 'C',
  },
  bloodGlucose: {
    type: Number, 
  },
  verificationCode:{
    type:String,
  },
  sharedEmails:{
    type:[String],
  }
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;