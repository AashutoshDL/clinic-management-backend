const express=require('express')
const router=express.Router();

const {getAdminById,createAdmin,deleteAdminById, getAllAdmin} = require("../../controllers/Admin/adminController")

router.get("/getAllAdmin",getAllAdmin);
router.get("/getAdminById/:id",getAdminById);
router.post("/createAdmin",createAdmin);
router.delete("/deleteAdminById/:id",deleteAdminById);

module.exports=router;  