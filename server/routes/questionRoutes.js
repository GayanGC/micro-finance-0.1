const express = require('express');
const router = express.Router();
const {
  askQuestion,
  getQuestions,
  answerQuestion,
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getQuestions)
  .post(protect, askQuestion);

router.route('/:id/answer')
  .put(protect, requireRole('admin'), answerQuestion);

module.exports = router;
