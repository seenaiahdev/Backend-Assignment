/**
 * Wraps an async route handler so any rejected promise is passed to
 * Express's error handling middleware instead of crashing the process.
 * This keeps controllers free of repetitive try/catch blocks.
 *
 * Usage:  router.get("/", asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
