/**
 * Handles requests to routes that don't exist (404).
 */
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

/**
 * Central error handler. Any error passed to next(err) or thrown in an
 * async handler ends up here, so responses stay consistent.
 *
 * Translates common Mongoose errors into friendly messages and codes:
 *  - CastError        → 400 Invalid ID
 *  - ValidationError  → 400 with the failing field messages
 *  - Duplicate key    → 400 (e.g. email already registered)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Invalid MongoDB ObjectId (e.g. /api/projects/not-a-real-id)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Duplicate unique field (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  res.status(statusCode).json({ message });
};

module.exports = { notFound, errorHandler };
