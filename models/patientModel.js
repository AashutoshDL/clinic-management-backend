const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: {
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
