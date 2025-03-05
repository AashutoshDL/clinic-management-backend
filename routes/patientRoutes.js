const express = require("express");
const router = express.Router();

// Import controller functions
const { getPatientById, getAllPatients, medicalHistory } = require("../controllers/Patient/patientController");

router.get("/getPatientById/:id", getPatientById);
router.get("/getAllPatients",getAllPatients);
router.post('/medicalHistory',medicalHistory);

module.exports = router;
