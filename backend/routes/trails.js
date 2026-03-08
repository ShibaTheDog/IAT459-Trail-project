const express = require("express");
const router = express.Router();
const Trail = require("../models/Trail");
const verifyToken = require("../middleware/auth"); // Your security guard!

// GET ROUTE: Open to visitors (Unauthenticated)
// Anyone can view the trails
router.get("/", async (req, res) => {
  try {
    const trails = await Trail.find().populate("user", "username"); // Grabs the creator's username
    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST ROUTE: Protected (Authenticated Members Only)
// Notice 'verifyToken' is passed in before the async function!
router.post("/", verifyToken, async (req, res) => {
  try {
    const newTrail = new Trail({
      ...req.body,
      user: req.user.id,
    });

    await newTrail.save();
    res.status(201).json(newTrail);
  } catch (err) {
    console.error("TRAIL SAVE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE ROUTE: Protected
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedTrail = await Trail.findByIdAndDelete(req.params.id);
    if (!deletedTrail)
      return res.status(404).json({ error: "Trail not found" });

    res.json({ message: "Trail successfully deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
