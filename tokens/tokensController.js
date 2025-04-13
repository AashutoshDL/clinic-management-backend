const jwt = require("jsonwebtoken");
  
  const createTokens = (user) => {
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );





  
    return { accessToken

      };
  };

  const setTokensInCookies = (res, accessToken) => {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 18000000,
    });






  };





















  module.exports.decodeToken = async(req,res) => {
      const {id,role}=req.user;
      res.json({id,role});
  }

  module.exports= {
    createTokens,
    setTokensInCookies,

  }