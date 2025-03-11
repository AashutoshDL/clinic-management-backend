const express = require("express");
const router = express.Router();

const { superadminRegister,updateSuperadminById,deleteSuperadminById, getsuperadmins} = require("../controllers/SuperAdmin/superadminController");

router.post("/superadminRegister", superadminRegister);
router.get("/getsuperadmins",getsuperadmins);
router.delete("/deletesuperadmin/:id",deleteSuperadminById);

module.exports = router;
