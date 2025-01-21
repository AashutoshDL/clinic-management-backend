const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser, updateUser, getUserById } = require("../controllers/profileController");

router.get("/profiles", getAllUsers);

router.get('/profile/:id',getUserById);

router.delete("/deleteProfiles/:id",deleteUser);

router.put('/updateProfiles/:id',updateUser)

module.exports = router;
