const express=require('express')
const router=express.Router();

const {createReportTemplate,getReportTemplateById,updateReportTemplate,deleteReportTemplate,getAllReportTemplates}=require('../controllers/Report/reportController')

router.post('/createReportTemplate',createReportTemplate);
router.get('/getReportTemplateById/:id',getReportTemplateById);
router.put('/updateReportTemplate/:id',updateReportTemplate);
router.delete('/deleteReportTemplate/:id',deleteReportTemplate);
router.get('/getAllReportTemplates',getAllReportTemplates);

module.exports=router