const Patient = require("../../models/patientModel");
const { messageResponse, errorResponse, successResponse } = require("../../utils/responseHandler");

// Fetch patient by ID
module.exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return messageResponse(res, 404, "Patient not found");
    }

    const patientData = {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      role: patient.role,
      accountCreated: patient.accountCreated || null,
    };
    
    successResponse(res, 200, patientData, "Patient fetched successfully");
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
