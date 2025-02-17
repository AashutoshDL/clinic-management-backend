const mongoose = require("mongoose");

const superadminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:[String],
    enum:['superadmin']
  },
  accountCreated:{
    type:String,
  }
});

const Superadmin = mongoose.model("Superadmin", superadminSchema);

module.exports = Superadmin;
