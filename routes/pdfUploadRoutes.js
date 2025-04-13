const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { uploadPDFByPatientId,getPDFByPatientId } = require('../controllers/pdfUploadController');

router.post('/uploadPDFByPatientId/:id', upload.single('report'), uploadPDFByPatientId);
router.get('/getPDFByPatientId/:id',getPDFByPatientId);

module.exports = router;
