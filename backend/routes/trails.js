const express = require("express");
const router = express.Router();
const Trail = require("../models/Trail");
const verifyToken = require("../middleware/auth"); 
const auth = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

// GET ROUTE: Open to visitors (Unauthenticated)
// Anyone can view all the trails
router.get("/", async (req, res) => {
  try {
    const trails = await Trail.find().populate("user", "username"); // Grabs the creator's username
    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET A SINGLE TRAIL ROUTE: Open to visitors
// This is the missing piece for your TrailDetail page!
router.get("/:id", async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id).populate(
      "user",
      "username",
    );

    if (!trail) {
      return res.status(404).json({ message: "Trail not found" });
    }

    res.json(trail);
  } catch (err) {
    console.error("Error fetching single trail:", err);
    res.status(500).json({ error: "Server error fetching trail details" });
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
    const trail = await Trail.findById(req.params.id);

    if (!trail) {
      return res.status(404).json({ error: "Trail not found" });
    }

    // Check if the logged-in user owns the trail
    if (trail.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this trail" });
    }

    await Trail.findByIdAndDelete(req.params.id);

    res.json({ message: "Trail successfully deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST ROUTE: User is reported
router.post("/:id/report", auth, async (req, res) => {
  try {
    const { reason, message } = req.body;
    const userId = req.user.id || req.user._id;

    if (!reason) {
      return res.status(400).json({ error: "Report reason is required" });
    }

    const trail = await Trail.findById(req.params.id);

    if (!trail) {
      return res.status(404).json({ error: "Trail not found" });
    }

    if (trail.user.toString() === userId.toString()) {
      return res.status(400).json({ error: "You cannot report your own post" });
    }

    const alreadyReported = trail.reports.some(
      (report) => report.reportedBy.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ error: "You have already reported this post" });
    }

    trail.reports.push({
      reportedBy: userId,
      reason,
      message: message || "",
    });

    trail.moderationStatus = "under_investigation";

    await trail.save();

    res.status(201).json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("REPORT TRAIL ERROR:", err.message);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// GET ROUTE: Retrieves reported posts through admin view
router.get(
  "/admin/reported",
  auth,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const reportedTrails = await Trail.find({
        $or: [
          { moderationStatus: "under_investigation" },
          { reports: { $exists: true, $not: { $size: 0 } } },
        ],
      })
        .populate("user", "username email")
        .populate("reports.reportedBy", "username email")
        .sort({ updatedAt: -1, _id: -1 });

      res.json(reportedTrails);
    } catch (err) {
      console.error("GET /api/trails/admin/reported error:", err.message);
      res.status(500).json({ error: "Failed to fetch reported trails" });
    }
  }
);

// DELETE ROUTE: Admin force deletes a post that is offensive (hopefully)
router.delete(
  "/admin/:id",
  auth,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const trail = await Trail.findById(req.params.id);

      if (!trail) {
        return res.status(404).json({ error: "Trail not found" });
      }

      await Trail.findByIdAndDelete(req.params.id);

      res.json({ message: "Trail deleted successfully by admin" });
    } catch (err) {
      console.error("ADMIN DELETE TRAIL ERROR:", err.message);
      res.status(500).json({ error: "Failed to delete trail" });
    }
  }
);




module.exports = router;
