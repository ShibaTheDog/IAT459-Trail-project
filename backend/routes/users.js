const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Trail = require("../models/Trail");
const auth = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

// Logged-in user deletes their own account
router.delete("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await Trail.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Your account and related trails were deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/users/me error:", err.message);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// Admin-only: get all users
router.get("/admin/users", auth, authorizeRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("GET /api/users/admin/users error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin-only: delete any user by id
router.delete("/admin/users/:id", auth, authorizeRole("admin"), async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const existingUser = await User.findById(targetUserId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await Trail.deleteMany({ user: targetUserId });
    await User.findByIdAndDelete(targetUserId);

    res.json({ message: "User and related trails deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/users/admin/users/:id error:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Admin-only: update a user's role
router.patch("/admin/users/:id/role", auth, authorizeRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("PATCH /api/users/admin/users/:id/role error:", err.message);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

module.exports = router;