const express = require('express');
const router  = express.Router();
const {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  getMonthSummary,
} = require('../controllers/attendanceController');
const { protect }     = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET  /api/attendance/my      — own attendance records
router.get('/my',      protect, getMyAttendance);

// GET  /api/attendance/all     — all records (admin)
router.get('/all',    protect, requireRole('admin'), getAllAttendance);

// GET  /api/attendance/summary — monthly summary for an employee
router.get('/summary', protect, getMonthSummary);

// POST /api/attendance         — mark own attendance (self-enforced in controller)
router.post('/', protect, markAttendance);

// PUT  /api/attendance/:id     — admin update attendance record
router.put('/:id', protect, requireRole('admin'), updateAttendance);

module.exports = router;
