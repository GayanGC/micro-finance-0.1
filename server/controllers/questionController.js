const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Submit a question (Employee)
// @route   POST /api/questions
// @access  Private
const askQuestion = asyncHandler(async (req, res, next) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    const err = new Error('Question content is required');
    err.statusCode = 400;
    return next(err);
  }

  const newQuestion = await Question.create({
    employeeId: req.user._id,
    question: question.trim(),
    status: 'Pending',
  });

  res.status(201).json({ success: true, message: 'Question submitted successfully', data: newQuestion });
});

// @desc    Get questions (Admin sees all, Employee sees own)
// @route   GET /api/questions
// @access  Private
const getQuestions = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'agent') {
    query.employeeId = req.user._id;
  }

  const questions = await Question.find(query)
    .populate('employeeId', 'name role')
    .populate('answeredBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: questions.length, data: questions });
});

// @desc    Answer a question (Admin only)
// @route   PUT /api/questions/:id/answer
// @access  Private/Admin
const answerQuestion = asyncHandler(async (req, res, next) => {
  const { answer } = req.body;

  if (!answer || !answer.trim()) {
    const err = new Error('Answer content is required');
    err.statusCode = 400;
    return next(err);
  }

  const question = await Question.findById(req.params.id);
  if (!question) {
    const err = new Error('Question not found');
    err.statusCode = 404;
    return next(err);
  }

  question.answer = answer.trim();
  question.status = 'Answered';
  question.answeredBy = req.user._id;
  question.answeredAt = new Date();

  await question.save();
  await question.populate('employeeId', 'name role');
  await question.populate('answeredBy', 'name');

  res.status(200).json({ success: true, message: 'Question answered successfully', data: question });
});

module.exports = {
  askQuestion,
  getQuestions,
  answerQuestion,
};
