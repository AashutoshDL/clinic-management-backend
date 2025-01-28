const Patient = require("../models/patientModel");

// Fetch doctor by ID
module.exports.getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract doctor ID from request parameters

    // Find doctor by ID
    const patient = await Patient.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Respond with doctor data
    res.status(200).json({
      message: "Patient fetched successfully",
      patient: {
                id: patient._id,
          userName: patient.userName,
               name:patient.name,
             email: patient.email,
              role: patient.role,
    accountCreated: patient.accountCreated || null,
      },
    });
  } catch (error) {
    console.error("Error fetching doctor", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch all doctors
module.exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find(); // Fetch all doctors from the database

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found" });
    }

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctors.map((doctor) => ({
        id: doctor._id,
        userName: doctor.userName,
        name:doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization || null,
        info: doctor.info || null,
        dutyTime: doctor.dutyTime || null,
        availableTimes: doctor.availableTimes || [],
        accountCreated: doctor.accountCreated || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching doctors", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete doctor
module.exports.deleteDoctor = async (req, res) => {
  const { id } = req.params; // Extract 'id' from URL parameter

  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id); // Use 'id' to find and delete the doctor by _id

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Edit (update) doctor
module.exports.updateDoctor = async (req, res) => {
  const { id } = req.params; // Extract 'id' from URL parameter
  const { firstName, lastName, userName, email, role, specialization, info, dutyTime, availableTimes } = req.body; // Extract doctor details from the request body

  try {
    // Find the doctor by _id and update the relevant fields
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { firstName, lastName, userName, email, role, specialization, info, dutyTime, availableTimes },
      { new: true } // This returns the updated doctor object
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Respond with the updated doctor details
    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: {
        id: updatedDoctor._id,
        userName: updatedDoctor.userName,
        name:updatedDoctor.name,
        email: updatedDoctor.email,
        role: updatedDoctor.role,
        specialization: updatedDoctor.specialization || null,
        info: updatedDoctor.info || null,
        dutyTime: updatedDoctor.dutyTime || null,
        availableTimes: updatedDoctor.availableTimes || [],
        accountCreated: updatedDoctor.accountCreated || null,
      },
    });
  } catch (error) {
    console.error("Error updating doctor", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Edit (update) doctor profile (specialization, description, and duty time)
module.exports.editProfile = async (req, res) => {
  const { id } = req.params; // Extract 'id' from URL parameter
  const { specialization, info, dutyTime } = req.body; // Extract specialization, description (info), and dutyTime from the request body

  try {
    // Find the doctor by _id and update the relevant fields
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { specialization, info, dutyTime }, // Only update the specialization, info (description), and dutyTime
      { new: true } // This returns the updated doctor object
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Respond with the updated doctor details
    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: {
        id: updatedDoctor._id,
        userName: updatedDoctor.userName,
        name:updatedDoctor.name,
        email: updatedDoctor.email,
        role: updatedDoctor.role,
        specialization: updatedDoctor.specialization || null,
        info: updatedDoctor.info || null,
        dutyTime: updatedDoctor.dutyTime || null,
        availableTimes: updatedDoctor.availableTimes || [],
        accountCreated: updatedDoctor.accountCreated || null,
      },
    });
  } catch (error) {
    console.error("Error updating doctor profile", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
