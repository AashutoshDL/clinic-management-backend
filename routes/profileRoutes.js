const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser, updateUser, getUserById } = require("../controllers/profileController");
const { setupProfileById }=require('../controllers/Patient/profileSetupController');

router.get("/profiles", getAllUsers);

router.get('/profile/:id',getUserById);

router.delete("/deleteProfiles/:id",deleteUser);

router.put('/updateProfiles/:id',updateUser);

router.post('/setupProfileById/:id',setupProfileById);

module.exports = router;
