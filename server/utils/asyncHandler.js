/**
 * Async handler wrapper — eliminates repetitive try/catch in every controller.
 * Catches rejected promises and forwards the error to Express error middleware.
 *
 * @param {Function} fn - async controller function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
