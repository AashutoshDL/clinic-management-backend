const PDF = require('../models/pdfModel');
const Patient=require('../models/patientModel');

module.exports.uploadPDFByPatientId = async (req, res) => {
  try {
    const patientId = req.params.id;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newReport = new PDF({
      patientId: patientId,
      url: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    await newReport.save();

    return res.status(200).json({
      message: 'PDF uploaded successfully',
      url: req.file.path,
      patientId: patientId,
      reportId: newReport._id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
};

module.exports.getPDFByPatientId = async (req, res) => {
    try {
      const patientId = req.params.id;

      const reports = await PDF.find({ patientId: patientId });
  
      if (reports.length === 0) {
        return res.status(404).json({ error: 'No reports found for this patient' });
      }

      return res.status(200).json({
        message: 'Reports fetched successfully',
        reports,
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  };
  
  // module.exports.uploadImageById = async (req, res) => {
  //   try {
  //     const patientId = req.params.id;
  //     if (!req.file || !req.file.path) {
  //       return res.status(400).json({ error: 'No image uploaded' });
  //     }
  
  //     // Find the patient by ID and update the profileImage field
  //     const patient = await Patient.findByIdAndUpdate(
  //       patientId,
  //       { profileImage: req.file.path },
  //       { new: true }
  //     );
  
  //     if (!patient) {
  //       return res.status(404).json({ error: 'Patient not found' });
  //     }
  
  //     return res.status(200).json({
  //       message: 'Profile image updated successfully',
  //       profileImage: req.file.path,
  //       patientId: patientId,
  //     });
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     res.status(500).json({ error: 'Failed to upload image' });
  //   }
  // };