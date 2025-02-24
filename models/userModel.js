const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    type: [String],
    enum:['user','patient','doctor','lab-technician','admin','superadmin']
  },
  accountCreated:{
    type:String,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
