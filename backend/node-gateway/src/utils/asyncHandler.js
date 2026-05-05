/**
 * Wraps an async route handler to catch rejected promises
 * and forward errors to Express error-handling middleware.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
