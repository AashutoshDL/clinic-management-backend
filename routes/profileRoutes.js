const express = require("express");
const router = express.Router();
const { Profile, getAllUsers, deleteUser, updateUser } = require("../controllers/profileController");
// const {
//   authenticateToken,
// } = require("../middlewares/authenticationMiddleware");

router.get("/profiles", getAllUsers);

router.delete("/profiles/:id",deleteUser);

router.put('/profiles/:id',updateUser)

module.exports = router;
