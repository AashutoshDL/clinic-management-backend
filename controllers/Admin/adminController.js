
const Admin=require('../../models/adminModel');
const {hashPassword}=require("../../utils/hashPassword");
const dayjs = require("dayjs");
const { successResponse, errorResponse, messageResponse } = require('../../utils/responseHandler');

module.exports.getAdminById = async(req,res) =>{
    try{
        const {id}=req.params;
        const admin=await Admin.findById(id);
        if(!admin){
            errorResponse(res,404,"Admin not found in the db");
        }
        const adminData={
            id:admin._id,
            name:admin.name,
            email:admin.email,
            password:admin.password,
            role:admin.role,
            accountCreate: admin.accountCreated || null,
        }
        successResponse(res,200,adminData,"Admin fetched successfully");
    }catch (error){
        errorResponse(res,500,"Internal Server Error");
    }
};

module.exports.createAdmin=async(req,res) =>{

    const {name,email,password}=req.body;
    if(!name||!email||!password){
        return res.status(400).json({message:"All fields are required for admin verification"})
    }
    try {
        const existingAdmin=await Admin.findOne({email});
        if(existingAdmin){
            errorResponse(res,404,"Admin is already present in the system");
        }
        const hashedPassword= await hashPassword(password);
        const newAdmin=new Admin({
            name,
            email,
            password:hashedPassword,
            role:"admin",
            accountCreated: dayjs().format("MMMM D, YYYY h:mm A"),
        })
        await newAdmin.save();
        successResponse(res,201,newAdmin,"Admin Created Successfully");
    } catch (error) {
        errorResponse(res,500,"Internal Server Error");
    }
};

module.exports.deleteAdminById=async(req,res)=>{
    const {id} = req.params;

    try{
        const deletedAdmin=await Admin.findByIdAndDelete(id);
        if(!deletedAdmin){
            errorResponse(res, 404, "Admin not found");
        }
        messageResponse(res,200,"Admin Deleted Successfully");
    }catch(error){
        errorResponse(res,500,"Internal Server Error");
    }
}

module.exports.getAllAdmin = async (req, res) => {
    try {
      const admins = await Admin.find(); 
  
      if (!admins || admins.length === 0) {
        errorResponse(res, 404, "Admins not found");
      }
      
      const adminsData=admins.map(admin=>({
        id:admin._id,
        name:admin.name,
        email:admin.email,
        role:admin.role,
        accountCreate: admin.accountCreated || null,
      }));
      successResponse(res,200,adminsData,"All admins fetched successfully");
    } catch (error) {
        errorResponse(res,500,"Internal Server Error");
    }
  };


  module.exports.createPatientByAdmin = async ()=>{
    
  }