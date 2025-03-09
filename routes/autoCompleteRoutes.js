const express=require('express')
const router=express.Router();

const {medicines} = require('../controllers/Meds/autoCompleteController');

router.get('/medicines',medicines);

module.exports=router;