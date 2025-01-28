const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    required:true,
  },
  accountCreated:{
    type:String,
  }
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
