const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    console.log("AUTH HEADER:", authHeader);
    console.log("JWT SECRET IN USE:", process.env.JWT_SECRET);

    if (!authHeader) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    console.log("EXTRACTED TOKEN:", token);

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    res.status(401).json({ error: "Token is not valid" });
  }
}

module.exports = auth;