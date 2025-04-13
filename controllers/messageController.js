const Chat = require("../models/chatModel")

const userSockets = {};

const addUser = (userId, socket) => {
  if (!userSockets[userId]) {
    userSockets[userId] = [];
  }
  userSockets[userId].push(socket);
};

const removeUser = (socket) => {
  for (const userId in userSockets) {
    userSockets[userId] = userSockets[userId].filter((s) => s !== socket);
    if (userSockets[userId].length === 0) delete userSockets[userId];
  }
};

const startChat = (socket, userId) => {
  addUser(userId, socket);

};

const sendMessage = async (socket, message) => {
  const { senderId, receiverId, message:text } = message;

  if (!senderId || !receiverId || !text) {


    console.error("Missing required fields in the message:", message);
    return;
  } 

  try {``

    const newMessage = new Chat({ senderId, receiverId, message: text });
    await newMessage.save();

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

const handleDisconnect = (socket) => {
  removeUser(socket);

};

module.exports = { startChat, sendMessage, handleDisconnect };
