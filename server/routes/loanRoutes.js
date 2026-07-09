const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getLoans, getLoan, createLoan, updateLoan, deleteLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const createValidation = [
  body('customer').notEmpty().withMessage('Customer ID is required').isMongoId().withMessage('Invalid customer ID'),
  body('type').notEmpty().withMessage('Loan type is required').isIn(['Daily', 'Wage', 'Insurance']).withMessage('Type must be Daily, Wage, or Insurance'),
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
  body('interestRate').optional().isFloat({ min: 0 }).withMessage('Interest rate must be non-negative'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
];

router.use(protect);

router.route('/')
  .get(getLoans)
  .post(createValidation, createLoan);

router.route('/:id')
  .get(getLoan)
  .put(updateLoan)
  .delete(requireRole('admin'), deleteLoan);

module.exports = router;
