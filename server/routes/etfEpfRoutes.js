const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRecords,
  bulkGenerate,
  createRecord,
  updateRecord,
  deleteRecord,
  getSummary,
} = require('../controllers/etfEpfController');

// All routes require authentication
router.use(protect);

// Summary
router.get('/summary', getSummary);

// Bulk generate for a month
router.post('/bulk', bulkGenerate);

// CRUD
router.get('/',    getRecords);
router.post('/',   createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
