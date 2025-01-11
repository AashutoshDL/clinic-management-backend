const express = require("express");
const router = express.Router();
const { Profile, getAllUsers, deleteUser, updateUser } = require("../controllers/profileController");
// const {
//   authenticateToken,
// } = require("../middlewares/authenticationMiddleware");

router.get("/profiles", getAllUsers);

router.delete("/profiles/:userId",deleteUser);

router.put('/profiles/:userId',updateUser)

module.exports = router;
