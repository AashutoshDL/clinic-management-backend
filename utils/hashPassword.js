const bcrypt=require("bcrypt");

const hashPassword=async(password)=>{
    const saltRounds=10;
    return await bcrypt.hash(password,saltRounds);
};

const verifyPassword=async(password,hashedPassowrd)=>{
    return await bcrypt.compare(password,hashedPassowrd);
};

module.exports= {hashPassword,verifyPassword};