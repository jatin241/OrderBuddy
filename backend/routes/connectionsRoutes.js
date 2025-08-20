// backend/routes/connectionsRoutes.js
const express = require("express");
const router = express.Router();
const BuddyRequest = require("../models/BuddyRequest");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { route } = require("./authRoutes");

// GET /api/connections
// Fetch all accepted connections for the logged-in user
// backend/routes/connectionsRoutes.js
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all accepted requests involving this user
    const requests = await BuddyRequest.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    });

    // Get the IDs of the "other" users
    const connectionIds = requests.map((r) =>
      r.sender.toString() === userId ? r.receiver : r.sender
    );

    // Fetch their user details
    const connections = await User.find(
      { _id: { $in: connectionIds } },
      "name email"
    );

    res.json(connections);
  } catch (err) {
    console.error("Error fetching connections:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports=router;