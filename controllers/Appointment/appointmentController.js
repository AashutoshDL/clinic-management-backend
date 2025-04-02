const Appointment = require('../../models/appointmentModel');
const Doctor = require("../../models/doctorModel");
const Patient = require("../../models/patientModel");

module.exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, doctorName, patientName, time } = req.body;
    const { id } = req.params;

    if (!doctorId || !patientId || !doctorName || !patientName || !time) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Verify user role
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(403).json({ message: 'Only patients can book an appointment.' });
    }

    if (id !== patientId) {
      return res.status(403).json({ message: 'Unauthorized: You can only book for yourself.' });
    }

    // Validate doctor existence
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Check if the appointment already exists
    const existingAppointment = await Appointment.findOne({ doctorId, patientId, time });
    if (existingAppointment) {
      return res.status(400).json({ message: 'You already have an appointment with this doctor at the selected time.' });
    }

    // Create and save the appointment
    const newAppointment = new Appointment({ doctorId, doctorName, patientId, patientName, time, status:"Pending" });
    await newAppointment.save();

    return res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports.getAppointmentsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointments = await Appointment.find({
      $or: [
        { doctorId: id },
        { patientId: id }
      ],
    });
    
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this user.' });
    }
    
    return res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Appointment ID is required.' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = "Confirmed";
    await appointment.save();

    return res.status(200).json({ message: 'Appointment confirmed successfully.', appointment });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
