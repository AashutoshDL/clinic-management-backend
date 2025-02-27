const express = require("express");
const cors = require("cors");
    
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const emailReminderRoutes = require('./routes/emailReminderRoutes');
const doctorRoutes=require("./routes/doctorRoutes");
const patientRoutes=require("./routes/patientRoutes");
const appointmentRoutes=require("./routes/appointmentRoutes");
const superadminRoutes=require("./routes/superadminRoutes");
const adminRoutes=require("./routes/Admin/adminRoutes");
const reportRoutes=require("./routes/reportTemplateRoute")

const {authenticateToken} = require("./middlewares/authenticationMiddleware");
const rateLimiter=require('./middlewares/rateLimiterMiddleware');

const mongoose = require("mongoose");
const app = express();

app.use(cors({
  origin:"http://localhost:5173",
  credentials: true, 
}));

app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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

app.get('/me', authenticateToken, (req,res)=>{
  const {id,role}=req.user;
  res.json({id,role});
})

app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use('/doctor',doctorRoutes);
app.use('/superadmin',superadminRoutes);
app.use('/appointments',appointmentRoutes);
app.use('/reminder', emailReminderRoutes);
app.use('/patient', patientRoutes);
app.use('/admin',adminRoutes);
app.use('/report',reportRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
