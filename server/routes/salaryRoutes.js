const express = require('express');
const router = express.Router();
const {
  getSalaryRecords,
  createSalaryRecord,
  updateSalaryRecord,
  requestAdvance,
  getAdvances,
  reviewAdvance,
  requestEmployeeLoan,
  getEmployeeLoans,
  reviewEmployeeLoan,
  repayEmployeeLoan,
} = require('../controllers/salaryController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Salary records
router.route('/records')
  .get(protect, getSalaryRecords)
  .post(protect, requireRole('admin'), createSalaryRecord);

router.route('/records/:id')
  .put(protect, requireRole('admin'), updateSalaryRecord);

// Advances
router.route('/advances')
  .get(protect, getAdvances)
  .post(protect, requestAdvance);

router.route('/advances/:id/review')
  .put(protect, requireRole('admin'), reviewAdvance);

// Employee Loans
router.route('/loans')
  .get(protect, getEmployeeLoans)
  .post(protect, requestEmployeeLoan);

router.route('/loans/:id/review')
  .put(protect, requireRole('admin'), reviewEmployeeLoan);

router.route('/loans/:id/repay')
  .post(protect, requireRole('admin'), repayEmployeeLoan);

module.exports = router;
