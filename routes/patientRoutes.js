const express = require("express");
const router = express.Router();

// Import controller functions
const { getPatientById } = require("../controllers/Patient/patientController");

router.get("/getPatientById/:id", getPatientById);

module.exports = router;
