const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, getLatestTransactions, deposit } = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all transaction routes
router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/latest', getLatestTransactions);
router.post('/deposit', deposit);

module.exports = router; 