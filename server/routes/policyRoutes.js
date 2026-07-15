const express = require('express');
const router  = express.Router();
const {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require('../controllers/policyController');
const { protect }     = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET  /api/policies   — all active policies (any authenticated user)
// POST /api/policies   — create policy (admin only)
router.route('/')
  .get(protect, getPolicies)
  .post(protect, requireRole('admin'), createPolicy);

// PUT    /api/policies/:id — update policy (admin)
// DELETE /api/policies/:id — soft-delete policy (admin)
router.route('/:id')
  .put(protect, requireRole('admin'), updatePolicy)
  .delete(protect, requireRole('admin'), deletePolicy);

module.exports = router;
