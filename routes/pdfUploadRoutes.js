const express = require('express');
const router = express.Router();
const {upload} = require('../middlewares/multer');
const { uploadPDFByPatientId,getPDFByPatientId } = require('../controllers/pdfUploadController');
const {summarizer}=require('../controllers/summarizer');

router.get('/getPDFByPatientId/:id',getPDFByPatientId);
router.post('/uploadPDFByPatientId/:id', upload.single('report'), uploadPDFByPatientId);
router.post('/summarizePdf/:id',summarizer);
// router.post('/uploadImageById/:id',uploadImage.any(),uploadImageById);

module.exports = router;
