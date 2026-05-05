/**
 * Centralized error handling middleware.
 * Catches all errors propagated via next(err) or thrown in async handlers.
 */

// ─── 404 Not Found Handler ─────────────────────────
export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ─── Global Error Handler ──────────────────────────
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  // Log error in development
  if (!isProduction) {
    console.error("─── ERROR ───");
    console.error(err);
  }

  // Handle specific Mongoose errors
  let message = err.message || "Internal Server Error";

  // Duplicate key error (e.g., unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    message = `Duplicate value for field: ${field}. Please use another value.`;
    err.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${messages.join(". ")}`;
    err.statusCode = 400;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
