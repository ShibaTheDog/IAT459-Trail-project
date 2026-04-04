const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select(
      "_id username email role suspended suspendedAt suspendedUntil"
    );

    if (!currentUser) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    if (currentUser.suspended) {
      const now = new Date();

      if (currentUser.suspendedUntil && currentUser.suspendedUntil <= now) {
        currentUser.suspended = false;
        currentUser.suspendedAt = null;
        currentUser.suspendedUntil = null;
        await currentUser.save();
      } else {
        return res.status(403).json({
          error: "Account is suspended",
          suspendedUntil: currentUser.suspendedUntil,
        });
      }
    }

    req.user = {
      id: currentUser._id.toString(),
      username: currentUser.username,
      email: currentUser.email,
      role: currentUser.role || "user",
      suspended: currentUser.suspended,
      suspendedUntil: currentUser.suspendedUntil,
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Token is not valid" });
  }
}

module.exports = auth;