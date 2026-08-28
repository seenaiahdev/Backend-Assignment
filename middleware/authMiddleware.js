const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication middleware.
 *
 * Flow:  Request → read Authorization header → extract token →
 *        verify token → load user → attach user to req → next()
 *
 * Responds with 401 Unauthorized if the token is missing, malformed,
 * expired, or the user no longer exists.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // The header must look like: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];

    // Verify signature and expiry.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user (without the password) to the request.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized, token is invalid or expired" });
  }
};

module.exports = { protect };
