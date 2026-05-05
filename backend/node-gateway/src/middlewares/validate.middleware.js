import AppError from "../utils/AppError.js";

/**
 * Creates Express middleware that validates `req.body` against a Zod schema.
 * @param {import("zod").ZodSchema} schema - A Zod schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const messages = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    throw new AppError(`Validation error: ${messages.join("; ")}`, 400);
  }

  // Replace body with parsed (and potentially transformed) data
  req.body = result.data;
  next();
};

export default validate;
