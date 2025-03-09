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
const reportRoutes=require("./routes/reportTemplateRoute");
const autoCompleteRoutes=require('./routes/autoCompleteRoutes');

const {authenticateToken} = require("./tokens/authenticateToken");
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

const mode='development';

const URL = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@pms.7s7kbw4.mongodb.net/PMS?retryWrites=true&w=majority&appName=PMS`;
const development_URL=`mongodb://127.0.0.1:27017/`;

const connectDB = async () => {
  try {
    if(mode=="development"){
      await mongoose.connect(development_URL);
      console.log("Local Database connected");
    }else{
      await mongoose.connect(URL);
      console.log("Cloud db connected")
    }
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
app.use("/user",authenticateToken,profileRoutes);
app.use('/doctor',authenticateToken, doctorRoutes);
app.use('/superadmin',authenticateToken, superadminRoutes);
app.use('/appointments',authenticateToken, appointmentRoutes);
app.use('/reminder', authenticateToken, emailReminderRoutes);
app.use('/patient',authenticateToken,  patientRoutes);
app.use('/admin',authenticateToken, adminRoutes);
app.use('/report',authenticateToken, reportRoutes);
app.use('/auto',autoCompleteRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
