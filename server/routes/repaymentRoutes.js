const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateRepaymentSchedule,
  getLoanRepayments,
  payInstallment,
  deleteSchedule,
} = require('../controllers/repaymentController');

// All routes require authentication
router.use(protect);

// Generate repayment schedule for a loan
router.post('/generate/:loanId', generateRepaymentSchedule);

// Get repayment schedule for a loan
router.get('/:loanId', getLoanRepayments);

// Pay an installment
router.put('/:id/pay', payInstallment);

// Delete entire schedule for a loan
router.delete('/loan/:loanId', deleteSchedule);

module.exports = router;
