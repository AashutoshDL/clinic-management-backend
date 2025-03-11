const jwt = require("jsonwebtoken");
  
  const createTokens = (user) => {
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
  
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  
    return { accessToken, refreshToken };
  };

  const setTokensInCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 3600000, // 1 hour
    });
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 604800000, // 7 days
    });
  };

    module.exports.refreshToken = async (req, res) => {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
    
      try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const { accessToken } = createTokens(payload);
    
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 3600000,
        });
    
        res.json({ accessToken });
      } catch (error) {
        console.error('Invalid refresh token:', error.message);
        res.status(401).json({ message: 'Invalid refresh token' });
      }
    };

    module.exports.decodeToken = async(req,res) => {
      const {id,role}=req.user;
      res.json({id,role});
    }