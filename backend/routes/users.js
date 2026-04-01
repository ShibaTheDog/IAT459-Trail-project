const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Trail = require("../models/Trail");
const verifyToken = require("../middleware/auth");

// DELETE /api/users/:id — delete own account + all associated trail posts
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    // Only allow users to delete their own account
    if (req.user.id.toString() !== req.params.id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove all trail posts belonging to this user
    await Trail.deleteMany({ user: req.params.id });

    // Remove the user account
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Account and all associated posts deleted successfully" });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
