const express = require('express');
const router = express.Router();

const {getDoctorById,getAllDoctors, deleteDoctor, editProfile, createDoctor}= require("../controllers/Doctor/doctorController");

// Route to set a reminder (schedules daily reminder)
router.get('/getDoctorById/:id', getDoctorById);

router.get('/getAllDoctors', getAllDoctors);

router.post('/deleteDoctors/:id',deleteDoctor );

router.post("/createDoctor",createDoctor);

router.post('/editProfile/:id',editProfile)

module.exports = router;