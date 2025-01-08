const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: false,
  },
  verificationCode: {
    type: String,
  },
  verificationExpires: {
    type: Date,
  },
  acceptedTerms:{
    type:Boolean,
    required:true,
  },
  role: {
    type: String,
    enum:['user','patient','doctor','lab-technician','admin','superadmin']
  }
});

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;
