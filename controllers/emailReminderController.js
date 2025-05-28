const reminderService = require('../services/reminderService');
const Patient = require('../models/patientModel');
const EmailReminder = require('../models/reminderModel');
const schedule = require('node-schedule');
const Appointment = require('../models/appointmentModel');
const dayjs = require('dayjs');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');


module.exports.getAllReminders = async (req, res) => {
  try {

    const reminders = await EmailReminder.find();

    if (!reminders || reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found.' });
    }

    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching all reminders:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};


module.exports.getReminderByPatientId = async (req, res) => {
  const { patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ message: 'Invalid patient ID format.' });
  }

  try {

    const reminders = await EmailReminder.find({ patientId });

    if (!reminders || reminders.length === 0) {
      return res.status(404).json({ message: 'No reminders found for this patient.' });
    }

    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by patient ID:', error);
    return res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};


module.exports.EmailReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const { patientId, patientName, doctorName, time, date } = appointment;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientEmail = patient.email;

    const existingReminder = await EmailReminder.findOne({ appointmentId: id });
    if (existingReminder) {
      return res.status(400).json({ message: "Reminder already set for this appointment" });
    }

    
    let appointmentDate = dayjs(date, 'YYYY-MM-DD');
    if (!appointmentDate.isValid()) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }
    appointmentDate = appointmentDate.toDate();  
    
    const startTimeString = time.split(" - ")[0];
    const [hours, minutes] = startTimeString.split(":").map(Number);
    const reminderTime = new Date(appointmentDate);
    reminderTime.setHours(hours, minutes + 5, 0, 0);  

    console.log("Reminder time",reminderTime)

    const newEmailReminder = new EmailReminder({
      appointmentId: id,
      email: patientEmail,
      doctorName,
      appointmentDate,
      appointmentTime: time,
      patientName,
      patientId,
      reminderTime,
    });

    await newEmailReminder.save();
    
    console.log(reminderTime)
    await reminderService.reminderService(
      id,
      reminderTime
    );

    res.json({ message: "Reminder set successfully", reminderTime});
    
  } catch (error) {
    console.error("Error setting email reminder:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports.cancelReminder = async (req, res) => {
  const { id } = req.params; 
  const { reminderTime, reminderMessage } = req.body;

  try {

    const reminders = await EmailReminder.find({
      userId: id,
      reminderTime,
      reminderMessage,
    });

    if (reminders.length === 0) {
      return res.status(404).json({ message: 'Reminder not found or already cancelled.' });
    }

    for (let reminder of reminders) {
      if (reminder.jobId && schedule.scheduledJobs[reminder.jobId]) {
        schedule.scheduledJobs[reminder.jobId].cancel();
        console.log(`Cancelled reminder job ID: ${reminder.jobId}`);
      } else {
        console.log("No scheduled job found for cancellation.");
      }

      await EmailReminder.findByIdAndDelete(reminder._id);
    }

    return res.status(200).json({ message: 'Reminder(s) cancelled successfully.' });
  } catch (error) {
    console.error('Error canceling reminder:', error);
    return res.status(500).json({ message: 'Failed to cancel reminder.' });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.testEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Recipient email ('to') is required." });
    }

    const sendTime = new Date(Date.now() + 60000); // 1 minute from now

    schedule.scheduleJob(sendTime, async () => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL,
          to,
          subject: '🏥 Medisys',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Medisys</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🏥 MediSys Changathali</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Better Healthcare. Closer to You.</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                  <p><strong>Dear Patient,</strong></p>
                  <p>This is a <strong>test notification</strong> from our automated appointment reminder system.</p>
                  <p><strong>Test Details:</strong></p>
                  <ul style="margin: 15px 0;">
                    <li>📅 Scheduled at: ${new Date().toLocaleString()}</li>
                    <li>✅ Email delivery: Successful</li>
                    <li>🔧 System status: Operational</li>
                  </ul>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                  <p style="margin: 0; font-size: 14px; color: #6c757d;">
                    <strong>Medisys Changathali</strong><br>
                    📍 Changathali, Mahalaxmi Municipality, Lalitpur, Nepal<br>
                    📞 +977 9803133855 | 📧 contact@medisysclinic.com
                  </p>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                  <p style="font-size: 12px; color: #868e96;">
                    This is an automated test message from MediSys Clinic's appointment system.<br>
                    Please do not reply to this email.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`✅ Test email sent to ${to} at ${new Date().toLocaleString()}`);
      } catch (err) {
        console.error("❌ Error sending test email:", err);
      }
    });

    res.json({
      message: `✅ Test email scheduled to be sent to ${to} at ${sendTime.toLocaleTimeString()}`,
    });
  } catch (error) {
    console.error("❌ Error in testEmail:", error);
    res.status(500).json({ message: "Server error in test email" });
  }
};


const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

module.exports.testInvoice = async (req, res) => {
  try {
    const { to, items = [], totalAmount = 0 } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Recipient email ('to') is required." });
    }

    const sendTime = new Date(Date.now() + 60000); // 1 minute from now

    schedule.scheduleJob(sendTime, async () => {
      try {
        // Generate PDF invoice
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
          const pdfData = Buffer.concat(buffers);

          await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: '🧾 Medisys Invoice - Medicine Billing',
            text: 'Please find attached your medicine bill from Medisys Changathali, Lalitpur.',
            attachments: [
              {
                filename: `invoice-${Date.now()}.pdf`,
                content: pdfData,
              },
            ],
          });

          console.log(`✅ Invoice email sent to ${to} at ${new Date().toLocaleString()}`);
        });

        // PDF Content
        doc.fontSize(20).text('Medisys Changathali, Lalitpur', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Medicine Invoice');
        doc.moveDown();

        const dateStr = new Date().toLocaleString();
        doc.fontSize(12).text(`Date: ${dateStr}`);
        doc.moveDown();

        if (items.length > 0) {
          doc.text('Medicines:');
          items.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name} - Qty: ${item.qty} - Price: Rs. ${item.price}`);
          });
          doc.moveDown();
          doc.fontSize(14).text(`Total Amount: Rs. ${totalAmount}`, { underline: true });
        } else {
          doc.text('No medicine items provided.');
        }

        doc.moveDown();
        doc.fontSize(10).text('Thank you for trusting Medisys. Stay healthy!');

        doc.end(); // Finalize PDF generation
      } catch (err) {
        console.error("❌ Error sending invoice email:", err);
      }
    });

    res.json({
      message: `✅ Medicine invoice scheduled to be sent to ${to} at ${sendTime.toLocaleTimeString()}`,
    });
  } catch (error) {
    console.error("❌ Error in testInvoice:", error);
    res.status(500).json({ message: "Server error in invoice email" });
  }
};
