const express = require('express');
const router  = express.Router();
const {
  getEmployees,
  registerEmployee,
  getEmployee,
  updateEmployee,
  getMyProfile,
  getDashboardStats,
} = require('../controllers/employeeController');
const { protect }      = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

// GET /api/employees/stats  — must be registered before /:id to avoid route conflict
router.get('/stats',      protect, requireRole('admin'), getDashboardStats);

// GET /api/employees/my-profile — own profile (any authenticated user)
router.get('/my-profile', protect, getMyProfile);

// GET /api/employees        — all employees (admin)
// POST /api/employees       — register new employee (admin)
router.route('/')
  .get(protect, requireRole('admin'), getEmployees)
  .post(protect, requireRole('admin'), registerEmployee);

// GET /api/employees/:id    — single employee (admin)
// PUT /api/employees/:id    — update employee (admin)
router.route('/:id')
  .get(protect, requireRole('admin'), getEmployee)
  .put(protect, requireRole('admin'), updateEmployee);

module.exports = router;
