const dayjs = require("dayjs");
const Doctor = require("../../models/doctorModel");
const { hashPassword } = require("../../utils/hashPassword");
const { errorResponse, successResponse } = require("../../utils/responseHandler");

module.exports.createDoctor=async(req,res)=>{
    const {name,email,password,role,specialization,dutyTime}=req.body;
    if(!name||!email||!password||!role||!specialization||!dutyTime){
      messageResponse(res,400,"All fields are required");
    }
  try{
    const existingDoctor= await Doctor.findOne({email});
    if(existingDoctor){
      errorResponse(res,404,"Doctor already exists in the system")
    }
    const hashedPassword=await hashPassword(password);
    const newDoctor=new Admin({
      name,
      email,
      password:hashedPassword,
      role,
      specialization,
      dutyTime,
      accountCreated:dayjs().format("MMMM D, YYYY h:mm A")
    })
    await newDoctor.save();
    successResponse(res,201,newDoctor,"New Doctor created successfully");
  }catch(error){
    errorResponse(res,500,"Internal Server Error");
  }
}

module.exports.getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params; 

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found in the database" });
    }

    res.status(200).json({
      message: "Doctor fetched successfully",
      doctor: {
        id: doctor._id,
        name:doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization || null,
        information: doctor.information || null,
        dutyTime: doctor.dutyTime || null,
        availableTimes: doctor.availableTimes || null,
        accountCreated: doctor.accountCreated || null,
      },
    });
  } catch (error) {
    console.error("Error fetching doctor", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find(); 

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found" });
    }

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctors.map((doctor) => ({
        id: doctor._id,
        name:doctor.name,
        email: doctor.email,
        role: doctor.role,
        specialization: doctor.specialization || null,
        information: doctor.information || null,
        dutyTime: doctor.dutyTime || null,
        availableTimes: doctor.availableTimes || null,
        accountCreated: doctor.accountCreated || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching doctors", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.deleteDoctor = async (req, res) => {
  const { id } = req.params; 

  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id); 

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateDoctor = async (req, res) => {
  const { id } = req.params; 
  const { name, email, role, specialization, information, dutyTime, availableTimes } = req.body; 

  try {

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { name,email, role, specialization, information, dutyTime, availableTimes },
      { new: true } 
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: {
        id: updatedDoctor._id,
        name:updatedDoctor.name,
        email: updatedDoctor.email,
        role: updatedDoctor.role,
        specialization: updatedDoctor.specialization || null,
        information: updatedDoctor.information || null,
        dutyTime: updatedDoctor.dutyTime || null,
        availableTimes: updatedDoctor.availableTimes || null,
        accountCreated: updatedDoctor.accountCreated || null,
      },
    });
  } catch (error) {
    console.error("Error updating doctor", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.editProfile = async (req, res) => {
  const { id } = req.params; 
  const { specialization, information, dutyTime,availableTimes } = req.body; 

  try {

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { specialization, information, dutyTime, availableTimes }, 
      { new: true } 
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: {
        id: updatedDoctor._id,
        name:updatedDoctor.name,
        email: updatedDoctor.email,
        role: updatedDoctor.role,
        specialization: updatedDoctor.specialization || null,
        information: updatedDoctor.information || null,
        dutyTime: updatedDoctor.dutyTime || null,
        availableTimes: updatedDoctor.availableTimes || null,
        accountCreated: updatedDoctor.accountCreated || null,
      },
    });
  } catch (error) {
    console.error("Error updating doctor profile", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};