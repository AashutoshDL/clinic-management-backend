const userSockets = {}; // This will store the socket connections based on the doctorId

// Start a chat with a specific doctor
const startChat = (socket, doctorId) => {
  userSockets[doctorId] = socket; // Store the socket connection for the doctor
  console.log(`User started chat with doctor ${doctorId}`);
};

// Send a message to the doctor
const sendMessage = (socket, message) => {
  const { recipientId, text, sender } = message;

  if (userSockets[recipientId]) {
    // Send the message to the connected doctor
    userSockets[recipientId].emit("receiveMessage", {
      text,
      sender,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    console.log(`Message sent to doctor ${recipientId}: ${text}`);
  } else {
    console.log("Doctor is not online.");
  }
};

// Handle a disconnect
const handleDisconnect = (socket) => {
  // Find and remove the socket from the userSockets map
  for (const doctorId in userSockets) {
    if (userSockets[doctorId] === socket) {
      delete userSockets[doctorId];
      console.log(`Doctor ${doctorId} disconnected`);
      break;
    }
  }
};

module.exports = {
  startChat,
  sendMessage,
  handleDisconnect,
};
