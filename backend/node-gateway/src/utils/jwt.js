import jwt from "jsonwebtoken";

/**
 * Generate a signed JWT for a given user ID.
 * @param {string} userId - MongoDB ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode a JWT.
 * @param {string} token - JWT string
 * @returns {object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
