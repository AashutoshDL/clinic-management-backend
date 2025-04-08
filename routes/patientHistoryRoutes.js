const express= require('express')
const router= express.Router();

const {saveHistory} = require('../controllers/History/medicalHistory');

router.post('/saveHistory',saveHistory);

module.exports=router;