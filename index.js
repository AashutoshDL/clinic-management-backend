const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const projectRoutes = require("./routes/projectRoutes");
// const mailerRoutes = require("./routes/mailerRoutes");

const authenticateToken = require("./middlewares/authenticationMiddleware");

const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.json());

require("dotenv").config();

const URL = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@pms.7s7kbw4.mongodb.net/PMS?retryWrites=true&w=majority&appName=PMS`;

const connectDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("Database connected");
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  }
};
connectDB();

//authentication routes
app.use("/auth", authRoutes);

app.use("/user", profileRoutes);

app.use("/projects", projectRoutes);

// app.use("/verification", mailerRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
