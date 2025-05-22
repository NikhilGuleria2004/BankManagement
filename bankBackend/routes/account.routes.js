const express = require('express');
const router = express.Router();
const { createAccount, getAccounts, getAccountDetails, updateAccountStatus, getAccountBalance } = require('../controllers/account.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all account routes
router.use(authMiddleware);

router.post('/', createAccount);
router.get('/', getAccounts);
router.get('/:accountNumber', getAccountDetails);
router.put('/:accountNumber/status', updateAccountStatus);
router.get('/:accountNumber/balance', getAccountBalance);

module.exports = router; 