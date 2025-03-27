const Chat = require("../models/chatModel")

const userSockets = {};

// Add user to the socket list
const addUser = (userId, socket) => {
  if (!userSockets[userId]) {
    userSockets[userId] = [];
  }
  userSockets[userId].push(socket);
};

// Remove user when they disconnect
const removeUser = (socket) => {
  for (const userId in userSockets) {
    userSockets[userId] = userSockets[userId].filter((s) => s !== socket);
    if (userSockets[userId].length === 0) delete userSockets[userId];
  }
};

// Start a chat: Track the user connection
const startChat = (socket, userId) => {
  addUser(userId, socket);
  // console.log(`User ${userId} connected on message controller`);
};

const sendMessage = async (socket, message) => {
  const { senderId, receiverId, message:text } = message;

  // Check if all required fields are present
  if (!senderId || !receiverId || !text) {
    // console.log(receiverId)
    // console.log(senderId)
    console.error("Missing required fields in the message:", message);
    return;
  } 

  try {``
    // Save message to MongoDB
    const newMessage = new Chat({ senderId, receiverId, message: text });
    await newMessage.save();

    // Deliver message to recipient if they're online
    if (userSockets[receiverId]) {
      userSockets[receiverId].forEach((recipientSocket) => {
        recipientSocket.emit("receiveMessage", {
          text,
          sender: senderId,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      });
    }
  } catch (error) {
    console.error("Error saving message:", error);
  }
};


// Handle user disconnection: clean up the socket list
const handleDisconnect = (socket) => {
  removeUser(socket);
  // console.log("User disconnected, cleaned up socket.");
};

// Export each function separately for use in index.js
module.exports = { startChat, sendMessage, handleDisconnect };
