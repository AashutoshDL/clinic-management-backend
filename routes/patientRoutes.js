const express = require("express");
const router = express.Router();

// Import controller functions
const { getPatientById, getAllPatients, createPatientReport, getPatientReportById } = require("../controllers/Patient/patientController");

router.get("/getPatientById/:id", getPatientById);
router.get("/getAllPatients",getAllPatients);
router.post('/createPatientReport',createPatientReport);
router.get("/patientReportById/:id",getPatientReportById);

module.exports = router;
