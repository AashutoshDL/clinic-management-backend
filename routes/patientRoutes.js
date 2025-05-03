const express = require("express");
const router = express.Router();
const { uploadImage } = require("../middlewares/multer");

const { getPatientById, getAllPatients, createPatientReport, getPatientReportById, setupProfileById, deletePatientById } = require("../controllers/Patient/patientController");
const { sendReportByEmail } = require("../controllers/shareReport");

router.get("/getAllPatients", getAllPatients);
router.get("/getPatientById/:id", getPatientById);
router.patch('/setupProfileById/:id', uploadImage.single('profileImage'), setupProfileById);
router.delete('/deletePatientById/:id', deletePatientById);

router.post('/createPatientReport', createPatientReport);
router.get("/patientReportById/:id", getPatientReportById);
router.post("/shareReportById/:reportId",sendReportByEmail);

module.exports = router;
