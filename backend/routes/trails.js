const express = require("express");
const router = express.Router();

const Trail = require("../models/Trail");
const User = require("../models/User");
const auth = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

// GET ALL TRAILS
// Public
router.get("/", async (req, res) => {
  try {
    const trails = await Trail.find()
      .populate("user", "username email")
      .populate("reports.reportedBy", "username email");

    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: GET REPORTED / FLAGGED TRAILS
// Admin only
router.get("/admin/reported", auth, authorizeRole("admin"), async (req, res) => {
  try {
    const reportedTrails = await Trail.find({
      $or: [
        { moderationStatus: "under_investigation" },
        { reports: { $exists: true, $not: { $size: 0 } } },
      ],
    })
      .populate("user", "username email")
      .populate("reports.reportedBy", "username email")
      .sort({ _id: -1 });

    res.json(reportedTrails);
  } catch (err) {
    console.error("GET /api/trails/admin/reported error:", err.message);
    res.status(500).json({ error: "Failed to fetch reported trails" });
  }
});

// ADMIN: DELETE ANY TRAIL
// Admin only
router.delete("/admin/:id", auth, authorizeRole("admin"), async (req, res) => {
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
});

//ADMIN: Resolve a falsely flagged post
//Admin only

router.patch(
  "/admin/:id/resolve",
  auth,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const trail = await Trail.findById(req.params.id);

      if (!trail) {
        return res.status(404).json({ error: "Trail not found" });
      }

      trail.moderationStatus = "active";
      trail.reports = [];

      await trail.save();

      res.json({
        message: "Trail report resolved successfully",
        trail,
      });
    } catch (err) {
      console.error("ADMIN RESOLVE TRAIL ERROR:", err.message);
      res.status(500).json({ error: "Failed to resolve trail report" });
    }
  }
);

// GET SINGLE TRAIL
// Public
router.get("/:id", async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id)
      .populate("user", "username email")
      .populate("reports.reportedBy", "username email");

    if (!trail) {
      return res.status(404).json({ error: "Trail not found" });
    }

    res.json(trail);
  } catch (err) {
    console.error("Error fetching single trail:", err.message);
    res.status(500).json({ error: "Server error fetching trail details" });
  }
});

// CREATE TRAIL
// Logged-in users only
router.post("/", auth, async (req, res) => {
  try {
    const newTrail = new Trail({
      ...req.body,
      user: req.user.id,
    });

    await newTrail.save();

    const savedTrail = await Trail.findById(newTrail._id).populate(
      "user",
      "username email"
    );

    res.status(201).json(savedTrail);
  } catch (err) {
    console.error("TRAIL SAVE ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE OWN TRAIL
// Logged-in owner only
router.delete("/:id", auth, async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id);

    if (!trail) {
      return res.status(404).json({ error: "Trail not found" });
    }

    if (trail.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this trail" });
    }

    await Trail.findByIdAndDelete(req.params.id);

    res.json({ message: "Trail successfully deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// REPORT A TRAIL
// Logged-in users only
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

    const alreadyReported = Array.isArray(trail.reports)
      ? trail.reports.some((report) => {
          const reportedById = report.reportedBy?._id || report.reportedBy;
          return String(reportedById) === String(userId);
        })
      : false;

    if (alreadyReported) {
      return res
        .status(400)
        .json({ error: "You have already reported this post" });
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


// FAVORITE / UNFAVORITE A TRAIL
// Logged-in users only
router.post("/:id/favorite", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const trailId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFavorited = user.favorites.includes(trailId);

    if (isFavorited) {
      // remove from favorites
      user.favorites = user.favorites.filter(
        (fav) => fav.toString() !== trailId
      );
    } else {
      // add to favorites
      user.favorites.push(trailId);
    }

    await user.save();

    res.json({
      message: isFavorited
        ? "Removed from favorites"
        : "Added to favorites",
      favorited: !isFavorited,
    });
  } catch (err) {
    console.error("FAVORITE ERROR:", err.message);
    res.status(500).json({ error: "Failed to update favorite" });
  }
});

//Admin view that can retrieve posts from a certain user: 
//GET: ADMIN ONLY
router.get(
  "/admin/user/:userId/posts",
  auth,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const search = (req.query.search || "").trim();

      const filter = { user: userId };

      if (search) {
        filter.title = { $regex: search, $options: "i" };
      }

      const trails = await Trail.find(filter)
        .populate("user", "username email")
        .sort({ _id: -1 });

      res.json(trails);
    } catch (err) {
      console.error("GET admin user posts error:", err.message);
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  }
);


module.exports = router;