const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // We just pass the password in; your User.js model automatically hashes it for us!
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "Hiker registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find the user in the database
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "Hiker not found" });

    // 2. Compare the typed password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 3. Generate the JWT "wristband"
    // We include the username in the token payload so your React frontend can display "Welcome, [Username]" later!
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
