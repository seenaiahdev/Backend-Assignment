const jwt = require("jsonwebtoken");

/**
 * Creates a signed JWT containing the user's id.
 * The token is verified later by the auth middleware.
 *
 * @param {string} userId - The MongoDB _id of the user.
 * @returns {string} A signed JWT.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
