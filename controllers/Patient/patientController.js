const Patient = require("../../models/patientModel");
const { messageResponse, errorResponse, successResponse } = require("../../utils/responseHandler");
const PatientReport = require("../../models/patientReport")

// Fetch patient by ID
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

// Create a new patient
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

// Delete patient by ID
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

// Fetch all patients
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
    // Find the patient by ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return errorResponse(res, 404, "Patient not found");
    }

    // Create a new medical history entry
    const newReport = new PatientReport({
      patientId,
      patientName,
      templateTitle,
      fields,
    });

    // Save the new medical history entry
    await newReport.save();

    // Ensure that the medicalHistory array is initialized before pushing
    if (!patient.medicalHistory) {
      patient.medicalHistory = [];
    }

    // Add the new medical history entry to the patient's record
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
    const { id } = req.params; // This is the patient ID
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
        const {
            name,
            email,
            userName,
            bloodType,
            height,
            heightUnit,
            weight,
            weightUnit,
            systolicBP,
            diastolicBP,
            heartRate,
            temperature,
            temperatureUnit,
            bloodGlucose
        } = req.body;

        const patient = await Patient.findById(id);

        if (!patient) {
            return messageResponse(res, 404, "Patient Not Found");
        }

        patient.name=name || patient.name,
        patient.userName= userName || patient.userName,
        patient.email = email || patient.email,
        patient.bloodType = bloodType || patient.bloodType;
        patient.height = height || patient.height;
        patient.heightUnit = heightUnit || patient.heightUnit;
        patient.weight = weight || patient.weight;
        patient.weightUnit = weightUnit || patient.weightUnit;
        patient.systolicBP = systolicBP || patient.systolicBP;
        patient.diastolicBP = diastolicBP || patient.diastolicBP;
        patient.heartRate = heartRate || patient.heartRate;
        patient.temperature = temperature || patient.temperature;
        patient.temperatureUnit = temperatureUnit || patient.temperatureUnit;
        patient.bloodGlucose = bloodGlucose || patient.bloodGlucose;

        await patient.save();

        return successResponse(res, 200, "Profile updated successfully", patient);
    } catch (error) {
        return errorResponse(res, 500, "Internal Server Error", error);
    }
};