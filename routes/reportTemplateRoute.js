const express=require('express')
const router=express.Router();

const {createReportTemplate,getReportTemplateById,updateReportTemplate,deleteReportTemplate,getAllReportTemplates}=require('../controllers/Report/reportController')

router.get('/getAllReportTemplates',getAllReportTemplates);
router.post('/createReportTemplate',createReportTemplate);
router.get('/getReportTemplateById/:id',getReportTemplateById);
router.patch('/updateReportTemplate/:id',updateReportTemplate);
router.delete('/deleteReportTemplate/:id',deleteReportTemplate);

module.exports=router