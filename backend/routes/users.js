const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Trail = require("../models/Trail");
const auth = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

// USER: DELETE OWN ACCOUNT
router.delete("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await Trail.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({
      message: "Your account and related trails were deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/users/me error:", err.message);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// ADMIN: GET ALL USERS
router.get("/admin/users", auth, authorizeRole("admin"), async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const filter = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalUsers / limit), 1);

    const users = await User.find(filter)
      .select("-password")
      .sort({ username: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
      },
    });
  } catch (err) {
    console.error("GET /api/users/admin/users error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ADMIN: SUSPEND / UNSUSPEND USER
/*
router.patch(
  "/admin/users/:id/suspension",
  auth,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { suspended, durationDays } = req.body;

      if (typeof suspended !== "boolean") {
        return res.status(400).json({ error: "Suspended must be true or false" });
      }

      const targetUser = await User.findById(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (String(targetUser._id) === String(req.user.id)) {
        return res.status(400).json({ error: "You cannot suspend your own account" });
      }

      if (targetUser.role === "admin") {
        return res.status(403).json({ error: "You cannot suspend another admin" });
      }

      if (suspended) {
        const parsedDays = Number(durationDays);

        if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
          return res.status(400).json({ error: "A valid suspension duration is required" });
        }

        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + parsedDays);

        targetUser.suspended = true;
        targetUser.suspendedAt = new Date();
        targetUser.suspendedUntil = suspendedUntil;
      } else {
        targetUser.suspended = false;
        targetUser.suspendedAt = null;
        targetUser.suspendedUntil = null;
      }

      await targetUser.save();

      res.json({
        message: suspended
          ? "User suspended successfully"
          : "User unsuspended successfully",
        user: {
          _id: targetUser._id,
          username: targetUser.username,
          email: targetUser.email,
          role: targetUser.role,
          suspended: targetUser.suspended,
          suspendedAt: targetUser.suspendedAt,
          suspendedUntil: targetUser.suspendedUntil,
        },
      });
    } catch (err) {
      console.error(
        "PATCH /api/users/admin/users/:id/suspension error:",
        err.message
      );
      res.status(500).json({ error: "Failed to update suspension status" });
    }
  }
);
*/

// ADMIN: DELETE USER
router.delete("/admin/users/:id", auth, authorizeRole("admin"), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (String(targetUser._id) === String(req.user.id)) {
      return res.status(400).json({ error: "You cannot delete your own admin account here" });
    }

    if (targetUser.role === "admin") {
      return res.status(403).json({ error: "You cannot delete another admin" });
    }

    await Trail.deleteMany({ user: targetUser._id });
    await User.findByIdAndDelete(targetUser._id);

    res.json({ message: "User and related trails deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/users/admin/users/:id error:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;