const express = require("express");
const router = express.Router();

// Import controller functions
const { getPatientById, getAllPatients, createPatientReport, getPatientReportById,setupProfileById } = require("../controllers/Patient/patientController");

router.get("/getPatientById/:id", getPatientById);
router.get("/getAllPatients",getAllPatients);
router.post('/createPatientReport',createPatientReport);
router.get("/patientReportById/:id",getPatientReportById);
router.patch('/setupProfileById/:id',setupProfileById);

module.exports = router;
