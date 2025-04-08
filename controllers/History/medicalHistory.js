const PatientHistory = require("../../models/patientHistory");

module.exports.saveHistory = async (req, res) => {
  try {
    const { patientId } = req.body;
    console.log(patientId)

    if (!req.body.entries) {
      return res.status(400).json({ message: "No history entries provided." });
    }

    const entries = JSON.parse(req.body.entries);

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "Invalid entries format." });
    }

    const savedHistories = [];

    for (const entry of entries) {
      const newHistory = new PatientHistory({
        patientId,
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
    res.status(500).json({ message: "Failed to save history." });
  }
};