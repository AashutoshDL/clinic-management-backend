const Patient = require("../../models/patientModel");
const { messageResponse, errorResponse, successResponse } = require("../../utils/responseHandler");
const PatientReport = require("../../models/patientReport")

module.exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return messageResponse(res, 404, "Patient not found");
    }
    
    successResponse(res, 200, patient, "Patient fetched successfully");
  } catch (error) {
    errorResponse(res, 500, "Internal Server Error");
  }
};

module.exports.createPatient = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return messageResponse(res, 400, "All fields are required");
    }

    const newPatient = new Patient({ name, email, password, role });
    await newPatient.save();
    
    successResponse(res, 201, newPatient, "Patient created successfully");
  } catch (error) {
    errorResponse(res, 500, "Error creating patient");
  }
};

module.exports.deletePatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return messageResponse(res, 404, "Patient not found");
    }

    successResponse(res, 200, null, "Patient deleted successfully");
  } catch (error) {
    errorResponse(res, 500, "Error deleting patient");
  }
};

module.exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    successResponse(res, 200, patients, "Patients fetched successfully");
  } catch (error) {
    errorResponse(res, 500, "Error fetching patients");
  }
};

module.exports.createPatientReport = async (req, res) => {
  const { reportData } = req.body;
  const { templateTitle, fields, patientId, patientName } = reportData;

  try {

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return errorResponse(res, 404, "Patient not found");
    }

    const newReport = new PatientReport({
      patientId,
      patientName,
      templateTitle,
      fields,
    });

    await newReport.save();

    if (!patient.medicalHistory) {
      patient.medicalHistory = [];
    }

    patient.medicalHistory.push(newReport._id);
    await patient.save();

    successResponse(res, 200, newReport, "Medical history saved successfully");
  } catch (error) {
    console.error("Error saving medical history:", error);
    errorResponse(res, 500, "Error saving medical history");
  }
};

module.exports.getPatientReportById = async (req, res) => {
  try {
    const { id } = req.params; 
    const reports = await PatientReport.find({ patientId: id });

    if (!reports || reports.length === 0) {
        return errorResponse(res, 404, "No medical history found for this patient");
    }

    successResponse(res, 200, reports, "Patient history fetched successfully");
} catch (error) {
    console.error("Error fetching medical history:", error);
    errorResponse(res, 500, "Internal Server Error");
}

};


module.exports.setupProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return messageResponse(res, 404, "Patient Not Found");
    }

    // Prepare all updatable fields
    const updateFields = {
      name: req.body.name,
      email: req.body.email,
      userName: req.body.userName,
      age: req.body.age,
      gender: req.body.gender,
      bloodType: req.body.bloodType,
      height: req.body.height,
      heightUnit: req.body.heightUnit,
      weight: req.body.weight,
      weightUnit: req.body.weightUnit,
      systolicBP: req.body.systolicBP,
      diastolicBP: req.body.diastolicBP,
      heartRate: req.body.heartRate,
      temperature: req.body.temperature,
      temperatureUnit: req.body.temperatureUnit,
      bloodGlucose: req.body.bloodGlucose,
    };

    // If a new image is uploaded, update profileImage
    if (req.file && req.file.path) {
      updateFields.profileImage = req.file.path;
    } else if (req.body.profileImage) {
      updateFields.profileImage = req.body.profileImage;
    }

    // Dynamically update only provided fields
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined) {
        patient[key] = updateFields[key];
      }
    });

    await patient.save();

    return successResponse(res, 200, "Profile updated successfully", patient);
  } catch (error) {
    console.error('Update Profile Error:', error);
    return errorResponse(res, 500, "Internal Server Error", error);
  }
};
