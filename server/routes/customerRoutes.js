const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const createValidation = [
  body('name').notEmpty().withMessage('Customer name is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
];

const updateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty').trim(),
];

router.use(protect); // all routes require auth

router.route('/')
  .get(getCustomers)
  .post(createValidation, createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateValidation, updateCustomer)
  .delete(requireRole('admin'), deleteCustomer);

module.exports = router;
