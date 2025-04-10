const express=require('express')
const router=express.Router();

const {medicines, diseases} = require('../controllers/Meds/autoCompleteController');

router.get('/medicines',medicines);
router.get('/diseases',diseases);

module.exports=router;