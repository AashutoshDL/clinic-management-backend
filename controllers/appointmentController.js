const Appointment = require('../models/appointmentModel'); // Assuming your model is Appointment
const User = require('../models/patientModel'); // Assuming you have a User model (Doctor/Patient)

const createAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, appointmentDate, status } = req.body;

    // Validate data
    if (!doctorId || !patientId || !appointmentDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the doctor and patient exist
    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Create the appointment
    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: patientId,
      appointmentDate,
      status: status || 'Scheduled', // Default status is 'Scheduled'
    });

    await newAppointment.save();
    return res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor patient') // Assuming you have references to doctor and patient
      .sort({ appointmentDate: 1 }); // Sort by date in ascending order

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor patient'); // Populate doctor and patient data

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    return res.status(200).json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, appointmentDate } = req.body;

    // Validate input
    if (!status && !appointmentDate) {
      return res.status(400).json({ message: 'At least one field is required to update.' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status,
        appointmentDate,
      },
      { new: true }
    ).populate('doctor patient');

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    return res.status(200).json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    return res.status(200).json({ message: 'Appointment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
};
