const Auth = require("../models/authModel");

// Fetch all users
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await Auth.find(); // Fetch all users from the database

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      users: users.map((user) => ({
        id: user._id, // Using _id to map user identifier
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountCreated: user.accountCreated || null, // Add creation date if your schema has it
      })),
    });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete user
module.exports.deleteUser = async (req, res) => {
  const { _id } = req.params; // Extract _id from URL parameter

  try {
    const deletedUser = await Auth.findByIdAndDelete(_id); // Find and delete the user by _id

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Edit (update) user
module.exports.updateUser = async (req, res) => {
  const { _id } = req.params; // Extract _id from URL parameter
  const { firstName, lastName, userName, email } = req.body; // Extract user details from the request body

  try {
    // Find the user by _id and update the relevant fields
    const updatedUser = await Auth.findByIdAndUpdate(
      _id,
      { firstName, lastName, userName, email },
      { new: true } // This returns the updated user object
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the updated user details
    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,  // Using _id to return the user
        email: updatedUser.email,
        userName: updatedUser.userName,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        accountCreated: updatedUser.accountCreated || null,
      },
    });
  } catch (error) {
    console.error("Error updating user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};