    const multer=require('multer')
    const {CloudinaryStorage}=require("multer-storage-cloudinary")
    const cloudinary= require('../utils/cloudinary');

    const storage= new CloudinaryStorage({
        cloudinary,
        params:{
            folder:"patient_reports",
            allowed_formats:['pdf'],
            resource_type:'raw',
        }
    });
    
    const upload= multer({storage});

    const imageStorage= new CloudinaryStorage({
        cloudinary,
        params:{
            folder:"patient_images",
            allowed_formats:['jpg','png','jpeg'],
            resource_type:'image',
        }
    });
    const uploadImage= multer({storage:imageStorage});


    module.exports={upload,uploadImage};