const successResponse=(res,statusCode,data,message="Success")=>{
    res.status(statusCode).json({success:true,message,data});
};

const errorResponse=(res,statusCode,errorMessage="Error")=>{
    console.error(errorMessage);
    res.status(statusCode).json({success:false,message:errorMessage})
}

const messageResponse= (res,statusCode,message="Success")=>{
    res.status(statusCode).json({message:message})
}

module.exports = {successResponse,errorResponse,messageResponse}