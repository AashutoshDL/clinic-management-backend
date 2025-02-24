const mongoose = require("mongoose");

const labTechSchema = new mongoose.Schema({
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
  role:{
    type:String,
    required:true,
  },
});

const LabTech = mongoose.model("LabTech", labTechSchema);

module.exports = LabTech;
