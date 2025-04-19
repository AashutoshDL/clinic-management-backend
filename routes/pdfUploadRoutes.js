const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { uploadPDFByPatientId,getPDFByPatientId } = require('../controllers/pdfUploadController');
const {summarizer}=require('../controllers/summarizer');

router.post('/uploadPDFByPatientId/:id', upload.single('report'), uploadPDFByPatientId);
router.get('/getPDFByPatientId/:id',getPDFByPatientId);
router.post('/summarizePdf',summarizer);

module.exports = router;
