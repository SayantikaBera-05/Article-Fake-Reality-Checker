/**
 * Input Sanitization Middleware
 * ─────────────────────────────
 * Protects against NoSQL injection by stripping keys that start
 * with `$` or contain `.` from request body, query, and params.
 *
 * Also trims string values to prevent whitespace-based attacks.
 *
 * This is a defense-in-depth layer — Mongoose schema validation
 * and Zod schemas are the primary lines of defense.
 */

const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip keys starting with '$' (NoSQL operators)
    if (key.startsWith("$")) continue;
    // Strip keys containing '.' (field path injection)
    if (key.includes(".")) continue;

    if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};
