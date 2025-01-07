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
    required: true,
  },
  verificationExpires: {
    type: Date,
    required: true,
  },
  acceptedTerms:{
    type:Boolean,
    required:true,
  }
});

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;
