const express= require('express')
const router= express.Router();

const {saveHistory,getHistoryByPatientId,getAllHistory} = require('../controllers/History/medicalHistory');

router.post('/saveHistory',saveHistory);
router.get('/getHistoryByPatientId/:patientId',getHistoryByPatientId);
router.get('/getAllHistory',getAllHistory);
module.exports=router;