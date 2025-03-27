const express = require("express");
const Chat = require("../models/chatModel");
const router = express.Router();

// Get chat history between two users
router.get("/history/:userId/:partnerId", async (req, res) => {
  try {
    const { userId, partnerId } = req.params;
    const messages = await Chat.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
