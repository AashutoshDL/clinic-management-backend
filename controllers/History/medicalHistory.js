const PatientHistory = require("../../models/patientHistory");
const mongoose=require('mongoose');

module.exports.getAllHistory = async (req, res) => {
  try {
    // Fetch all patient history entries
    const histories = await PatientHistory.find();

    // If no histories found, return a 404
    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: 'No history entries found.' });
    }

    // Return the found histories
    res.status(200).json({
      data: histories.map(entry => ({
        _id: entry._id,
        patientId: entry.patientId,
        date: entry.date,
        doctorName: entry.doctorName,
        hospitalName: entry.hospitalName,
        diseases: entry.diseases,
        medicines: entry.medicines,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }))
    });
  } catch (error) {
    console.error('Error fetching all patient history:', error);
    res.status(500).json({ message: 'Failed to fetch patient history.', error: error.message });
  }
};


module.exports.saveHistory = async (req, res) => {
  try {
    const { patientId, entries } = req.body;

    // Validate patientId
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required." });
    }

    // Validate entries
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "Invalid or missing history entries." });
    }

    const savedHistories = [];

    for (const entry of entries) {
      const newHistory = new PatientHistory({
        patientId: new mongoose.Types.ObjectId(patientId),
        date: entry.date,
        doctorName: entry.doctorName,
        hospitalName: entry.hospitalName,
        diseases: entry.diseases,
        medicines: entry.medicines, 
      });

      const saved = await newHistory.save();
      savedHistories.push(saved);
    }

    res.status(201).json({
      message: "Histories saved successfully.",
      data: savedHistories,
    });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({ message: "Failed to save history.", error: error.message });
  }
};


module.exports.getHistoryByPatientId = async (req, res) => {
  const { patientId } = req.params;

  // Check if the patientId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ message: "Invalid patient ID." });
  }

  try {
    // Convert the patientId to ObjectId for the query
    const histories = await PatientHistory.find({ patientId: new mongoose.Types.ObjectId(patientId) });

    // Check if no histories are found
    if (histories.length === 0) {
      return res.status(404).json({ message: "No history entries found for this patient." });
    }

    // Return the fetched histories
    res.status(200).json({
      data: histories.map(entry => ({
        _id: entry._id,
        patientId: entry.patientId,
        date: entry.date,
        doctorName: entry.doctorName,
        hospitalName: entry.hospitalName,
        diseases: entry.diseases,
        medicines: entry.medicines,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }))
    });
  } catch (error) {
    console.error("Error fetching patient history:", error);
    res.status(500).json({ message: "Failed to fetch patient history.", error: error.message });
  }
};