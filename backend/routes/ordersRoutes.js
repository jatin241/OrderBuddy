const express = require("express");
const Order = require("../models/Order");
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
        address: location.address || "", // store human-readable address if available
      },
    });

    await newOrder.save();
    res.status(201).json({ message: "Order shared successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby orders based on user location
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      // Return all orders if no location provided
      const orders = await Order.find().populate("sharedBy", "name");
      return res.json({ orders });
    }

    const userLocation = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    const maxDistance = 3000; // 3 km in meters

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
          location: 1,  // includes coordinates + address
          distance: 1,
          "sharedBy.name": 1,
        },
      },
    ]);

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders created by the logged-in user
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const myOrders = await Order.find({ sharedBy: req.user.id })
      .populate("sharedBy", "name")
      .select("restaurant items deliveryTime location"); // include location with address

    res.json({ orders: myOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
