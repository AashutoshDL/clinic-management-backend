const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const PatientReport = require('../models/patientReport.js');
const PatientModel = require('../models/patientModel.js');

module.exports.sendReportByEmail = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await PatientReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!report.patientId) {
      return res.status(400).json({ message: 'Patient ID missing in report' });
    }

    const patient = await PatientModel.findById(report.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const emailsToShare = patient.sharedEmails;
    if (!emailsToShare || emailsToShare.length === 0) {
      return res.status(400).json({ message: 'No sharing emails found for the patient' });
    }

    const pdfBuffer = await generateReportPDF(report);

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Medical Reports" <${process.env.EMAIL_USER}>`,
      to: emailsToShare,
      subject: `Medical Report for ${report.patientName}`,
      text: `Dear recipient,\n\nPlease find attached the medical report for ${report.patientName}.`,
      attachments: [
        {
          filename: `${report.templateTitle}-${report.patientName}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    res.status(200).json({ message: 'Report shared successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

function generateReportPDF(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.fontSize(20).text(report.templateTitle, { align: 'center' });
    doc.moveDown();

    report.fields.forEach((field) => {
      doc.fontSize(12).text(`${field.label}: ${field.value}`);
    });

    doc.end();
  });
}
