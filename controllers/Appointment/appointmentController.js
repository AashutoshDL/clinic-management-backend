const Appointment = require('../../models/appointmentModel');
const Doctor = require("../../models/doctorModel");
const Patient = require("../../models/patientModel");

module.exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, doctorName, patientName, date, time } = req.body;
    const { id } = req.params;

    if (!doctorId || !patientId || !doctorName || !patientName || !time ||!date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(403).json({ message: 'Only patients can book an appointment.' });
    }

    if (id !== patientId) {
      return res.status(403).json({ message: 'Unauthorized: You can only book for yourself.' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const existingAppointment = await Appointment.findOne({ doctorId, patientId, time, date });
    if (existingAppointment) {
      return res.status(400).json({ message: 'You already have an appointment with this doctor at the selected time.' });
    }

    const newAppointment = new Appointment({ doctorId, doctorName, patientId, patientName,date, time, status:"Pending" });
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

module.exports.cancelAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Appointment ID is required.' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    return res.status(200).json({ message: 'Appointment cancelled successfully.', appointment });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
