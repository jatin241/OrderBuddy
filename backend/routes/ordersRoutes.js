const express = require("express");
const Order = require("../models/Order");
const BuddyRequest = require("../models/BuddyRequest");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { restaurant, items, deliveryTime, location } = req.body;

    if (!restaurant || !items || !location || !location.coordinates) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      restaurant,
      items,
      deliveryTime,
      sharedBy: req.user.id,
      location: {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address || "",
      },
    });

    await newOrder.save();
    res.status(201).json({ message: "Order shared successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get nearby orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      const orders = await Order.find().populate("sharedBy", "name");
      return res.json({ orders });
    }

    const userLocation = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    const maxDistance = 3000;

    const orders = await Order.aggregate([
      {
        $geoNear: {
          near: userLocation,
          distanceField: "distance",
          maxDistance: maxDistance,
          spherical: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sharedBy",
          foreignField: "_id",
          as: "sharedBy",
        },
      },
      { $unwind: "$sharedBy" },
      {
        $project: {
          restaurant: 1,
          items: 1,
          deliveryTime: 1,
          location: 1,
          distance: 1,
          "sharedBy.name": 1,
        },
      },
    ]);

    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get my orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const myOrders = await Order.find({ sharedBy: req.user.id })
      .populate("sharedBy", "name")
      .select("restaurant items deliveryTime location");

    res.json({ orders: myOrders });
  } catch (error) {
    console.error("Error fetching my orders:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Buddy Up Request
 */
// Send buddy request
router.post("/buddy-request/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const orderOwnerId = order.sharedBy._id ? order.sharedBy._id.toString() : order.sharedBy.toString();

    if (orderOwnerId === req.user.id) {
      return res.status(400).json({ message: "You cannot buddy up with your own order" });
    }

    const existingRequest = await BuddyRequest.findOne({
      order: order._id,
      sender: req.user.id,
      receiver: orderOwnerId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Buddy request already sent" });
    }

    const buddyRequest = new BuddyRequest({
      order: order._id,
      sender: req.user.id,
      receiver: orderOwnerId,
    });

    await buddyRequest.save();

    res.status(201).json({ message: "Buddy request sent successfully", buddyRequest });
  } catch (error) {
    console.error("Buddy request error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending buddy requests for logged-in user
router.get("/buddy-requests", authMiddleware, async (req, res) => {
  try {
    const requests = await BuddyRequest.find({
      receiver: req.user.id,
      status: "pending",
    })
      .populate("sender", "name")
      .sort({ createdAt: -1 });

    const formatted = requests.map((r) => ({
      _id: r._id,
      senderName: r.sender.name,
      orderId: r.order,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching buddy requests:", err);
    res.status(500).json({ message: "Failed to fetch buddy requests" });
  }
});

// Accept buddy request
router.post("/buddy-requests/:id/accept", authMiddleware, async (req, res) => {
  try {
    const request = await BuddyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "accepted";
    await request.save();
    res.json({ message: "Buddy request accepted" });
  } catch (err) {
    console.error("Error accepting buddy request:", err);
    res.status(500).json({ message: "Failed to accept request" });
  }
});

// Reject buddy request
router.post("/buddy-requests/:id/reject", authMiddleware, async (req, res) => {
  try {
    const request = await BuddyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "rejected";
    await request.save();
    res.json({ message: "Buddy request rejected" });
  } catch (err) {
    console.error("Error rejecting buddy request:", err);
    res.status(500).json({ message: "Failed to reject request" });
  }
});

module.exports = router;
