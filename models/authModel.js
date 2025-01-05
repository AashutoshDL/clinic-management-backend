const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
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
  verificationCode: {
    type: String,
    required: true,
  },
  verificationExpires: {
    type: Date,
    required: true,
  },
  termsandconditions:{
    type:Boolean,
    required:true,
  }
});

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;
