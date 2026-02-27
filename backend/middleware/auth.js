const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // 1. Get the token from the header (This is what your React app will send later)
  const token = req.header("Authorization");

  // 2. Check if the token exists at all
  if (!token)
    return res
      .status(401)
      .json({ error: "Access Denied. Please log in to your hiker account." });

  try {
    // 3. Verify the token using the secret key from your .env file
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info (like their ID and username) to the request
    req.user = verified;

    // Let them pass through to the protected route!
    next();
  } catch (err) {
    res
      .status(400)
      .json({ error: "Invalid Token. Your session may have expired." });
  }
}

module.exports = auth;
