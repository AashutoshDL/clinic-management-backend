const Patient = require('../../models/patientModel');
const { messageResponse, errorResponse, successResponse } = require('../../utils/responseHandler');

module.exports.setupProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const {
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