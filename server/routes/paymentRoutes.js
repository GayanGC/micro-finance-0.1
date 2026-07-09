const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getTodayCollections, createPayment, getLoanPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const createValidation = [
  body('loanId').notEmpty().withMessage('Loan ID is required').isMongoId().withMessage('Invalid loan ID'),
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
  body('note').optional().trim(),
];

router.use(protect);

router.get('/today', getTodayCollections);
router.get('/loan/:loanId', getLoanPayments);
router.post('/', createValidation, createPayment);

module.exports = router;
