const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const chatController = require("./controllers/messageController"); 

const authRoutes = require("./routes/authRoutes");
const emailReminderRoutes = require("./routes/emailReminderRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const superadminRoutes = require("./routes/superadminRoutes");
const adminRoutes = require("./routes/Admin/adminRoutes");
const reportRoutes = require("./routes/reportTemplateRoute");
const autoCompleteRoutes = require("./routes/autoCompleteRoutes");
const messageRoutes=require("./routes/messageRoutes");
const patientHistoryRoutes = require("./routes/patientHistoryRoutes");
const pdfUploadRoutes=require('./routes/pdfUploadRoutes');

const { authenticateToken } = require("./tokens/authenticateToken");

const app = express();
const server = http.createServer(app); 

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const mode = "development";
const URL = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@pms.7s7kbw4.mongodb.net/PMS?retryWrites=true&w=majority&appName=PMS`;
const development_URL = `mongodb://127.0.0.1:27017/`;

const connectDB = async () => {
  try {
    await mongoose.connect(mode === "development" ? development_URL : URL);
    console.log(`${mode === "development" ? "Local" : "Cloud"} Database connected`);
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  }
};
connectDB();

app.get("/me", authenticateToken, (req, res) => {
  const { id, role } = req.user;
  res.json({ id, role });
});

app.use("/auth", authRoutes);
app.use("/doctor", doctorRoutes);
app.use("/superadmin", superadminRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/reminder", emailReminderRoutes);
app.use("/patient", patientRoutes);
app.use("/admin", adminRoutes);
app.use("/report", reportRoutes);
app.use("/history",patientHistoryRoutes)
app.use("/auto", autoCompleteRoutes);
app.use("/chat",messageRoutes);
app.use('/uploads',pdfUploadRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {


  socket.on("startChat", ({ userId }) => {
    chatController.startChat(socket, userId);
  });

  socket.on("sendMessage", async (message) => {
    await chatController.sendMessage(socket, message);
  });

  socket.on("disconnect", () => {
    chatController.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});