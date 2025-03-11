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
    enum:['user','patient','doctor','lab-technician','admin','superadmin']
  },
  accountCreated:{
    type:String,
  }
});

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
