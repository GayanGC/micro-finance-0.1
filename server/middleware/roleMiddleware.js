/**
 * Role-based access middleware.
 * Usage: router.delete('/:id', protect, requireRole('admin'), controller)
 *
 * @param {...string} roles - Allowed roles, e.g. 'admin' or 'admin','agent'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorised',
        statusCode: 401,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — requires role: ${roles.join(' or ')}`,
        statusCode: 403,
      });
    }

    next();
  };
};

module.exports = { requireRole };
