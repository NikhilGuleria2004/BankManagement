const Account = require('../models/account.model');
const Transaction = require('../models/transaction.model');

const createAccount = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.id;

    // Generate unique account number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const account = await Account.create({
      accountNumber,
      type,
      userId
    });

    res.status(201).json({
      message: 'Account created successfully',
      account
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
};

const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await Account.findAll({
      where: { userId },
      attributes: ['id', 'accountNumber', 'type', 'balance', 'status']
    });

    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ 
      message: 'Error fetching accounts',
      error: error.message 
    });
  }
};

const getAccountDetails = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const userId = req.user.id;

    const account = await Account.findOne({
      where: { accountNumber, userId },
      include: [
        {
          model: Transaction,
          as: 'outgoingTransactions',
          limit: 10,
          order: [['createdAt', 'DESC']]
        },
        {
          model: Transaction,
          as: 'incomingTransactions',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account details', error: error.message });
  }
};

const updateAccountStatus = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const account = await Account.findOne({ where: { accountNumber, userId } });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await account.update({ status });
    res.json({ message: 'Account status updated successfully', account });
  } catch (error) {
    res.status(500).json({ message: 'Error updating account status', error: error.message });
  }
};

const getAccountBalance = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const userId = req.user.id;

    const account = await Account.findOne({
      where: { accountNumber, userId },
      attributes: ['accountNumber', 'balance', 'type', 'status']
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({
      accountNumber: account.accountNumber,
      balance: account.balance,
      type: account.type,
      status: account.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account balance', error: error.message });
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccountDetails,
  updateAccountStatus,
  getAccountBalance
}; 