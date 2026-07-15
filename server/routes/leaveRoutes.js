const express = require('express');
const router  = express.Router();
const {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} = require('../controllers/leaveController');
const { protect }     = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET  /api/leaves/my   — own leave requests
router.get('/my',  protect, getMyLeaves);

// GET  /api/leaves/all  — all leave requests (admin)
router.get('/all', protect, requireRole('admin'), getAllLeaves);

// POST /api/leaves      — submit a leave request
router.post('/', protect, requestLeave);

// PUT  /api/leaves/:id/review — approve or reject (admin)
router.put('/:id/review', protect, requireRole('admin'), reviewLeave);

module.exports = router;
