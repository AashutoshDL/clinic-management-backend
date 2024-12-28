const Auth = require("../models/authModel");

module.exports.Profile = async (req, res, next) => {
  try {
    const user = await Auth.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        email: user.email,
        password: user.password,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
