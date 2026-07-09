const express = require('express');
const router = express.Router();
const { getSummary, getTrend, getBreakdown } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Reports available to all authenticated users for basic summary,
// but full trend/breakdown requires admin role
router.use(protect);

router.get('/summary', getSummary);
router.get('/trend', requireRole('admin', 'agent'), getTrend);
router.get('/breakdown', requireRole('admin', 'agent'), getBreakdown);

module.exports = router;
