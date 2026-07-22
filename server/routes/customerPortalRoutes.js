const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyProfile,
  getMyLoans,
  getMyLoanRepayments,
} = require('../controllers/customerPortalController');

// All customer portal routes require authentication
router.use(protect);

router.get('/profile', getMyProfile);
router.get('/my-loans', getMyLoans);
router.get('/repayments/:loanId', getMyLoanRepayments);

module.exports = router;
