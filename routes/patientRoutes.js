const express = require("express");
const router = express.Router();

// Import controller functions
const { getPatientById} = require("../controllers/patientController");

router.get("/getPatientById", getPatientById);

module.exports = router;
