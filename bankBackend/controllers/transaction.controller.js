const { sequelize, Op } = require('../config/database');
const Account = require('../models/account.model');
const Transaction = require('../models/transaction.model');

const createTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { amount, type, description, destinationAccountNumber, accountNumber } = req.body;
    const userId = req.user.id;

    // Verify source account belongs to user
    const sourceAccount = await Account.findOne({
      where: { accountNumber, userId }
    });

    if (!sourceAccount) {
      await t.rollback();
      return res.status(404).json({ message: 'Source account not found' });
    }

    if (sourceAccount.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ message: 'Source account is not active' });
    }

    let destinationAccount;
    if (type === 'transfer') {
      destinationAccount = await Account.findOne({
        where: { accountNumber: destinationAccountNumber }
      });

      if (!destinationAccount) {
        await t.rollback();
        return res.status(404).json({ message: 'Destination account not found' });
      }

      if (destinationAccount.status !== 'active') {
        await t.rollback();
        return res.status(400).json({ message: 'Destination account is not active' });
      }
    }

    // Check sufficient balance for withdrawals and transfers
    if ((type === 'withdrawal' || type === 'transfer') && sourceAccount.balance < amount) {
      await t.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      amount,
      type,
      description,
      sourceAccountId: sourceAccount.id,
      destinationAccountId: destinationAccount?.id,
      status: 'completed'
    }, { transaction: t });

    // Update account balances
    if (type === 'deposit') {
      await sourceAccount.increment('balance', { by: amount, transaction: t });
    } else if (type === 'withdrawal') {
      await sourceAccount.decrement('balance', { by: amount, transaction: t });
    } else if (type === 'transfer') {
      await sourceAccount.decrement('balance', { by: amount, transaction: t });
      await destinationAccount.increment('balance', { by: amount, transaction: t });
    }

    await t.commit();
    res.status(201).json({
      message: 'Transaction completed successfully',
      transaction
    });
  } catch (error) {
    await t.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Error processing transaction', error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountNumber } = req.params;

    // Get all user's accounts first
    const userAccounts = await Account.findAll({
      where: { userId },
      attributes: ['id']
    });

    if (!userAccounts.length) {
      return res.json([]);
    }

    const accountIds = userAccounts.map(account => account.id);

    // Get transactions for all user's accounts
    const transactions = await Transaction.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { sourceAccountId: { [sequelize.Sequelize.Op.in]: accountIds } },
          { destinationAccountId: { [sequelize.Sequelize.Op.in]: accountIds } }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Account,
          as: 'sourceAccount',
          attributes: ['accountNumber', 'type']
        },
        {
          model: Account,
          as: 'destinationAccount',
          attributes: ['accountNumber', 'type']
        }
      ]
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

const getLatestTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user's accounts
    const accounts = await Account.findAll({
      where: { userId }
    });

    if (!accounts || accounts.length === 0) {
      return res.json({ transactions: [] });
    }

    const accountIds = accounts.map(account => account.id);

    // Get latest transactions for all accounts
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { sourceAccountId: { [Op.in]: accountIds } },
          { destinationAccountId: { [Op.in]: accountIds } }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        {
          model: Account,
          as: 'sourceAccount',
          attributes: ['accountNumber', 'type']
        },
        {
          model: Account,
          as: 'destinationAccount',
          attributes: ['accountNumber', 'type']
        }
      ]
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get latest transactions error:', error);
    res.status(500).json({ 
      message: 'Error getting latest transactions',
      error: error.message 
    });
  }
};

const deposit = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { amount, description } = req.body;
    const accountNumber = req.params.accountNumber;
    const userId = req.user.id;

    // Verify account belongs to user and is active
    const account = await Account.findOne({
      where: { accountNumber, userId }
    });

    if (!account) {
      await t.rollback();
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.status !== 'active') {
      await t.rollback();
      return res.status(400).json({ message: 'Account is not active' });
    }

    // Validate amount
    if (amount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Deposit amount must be greater than 0' });
    }

    // Create deposit transaction
    const transaction = await Transaction.create({
      amount,
      type: 'deposit',
      description: description || 'Deposit',
      sourceAccountId: account.id,
      status: 'completed'
    }, { transaction: t });

    // Update account balance using increment
    await account.increment('balance', { by: amount, transaction: t });

    // Refresh the account to get updated balance
    await account.reload({ transaction: t });

    await t.commit();
    res.status(201).json({
      message: 'Deposit successful',
      transaction,
      newBalance: account.balance
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error processing deposit', error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getLatestTransactions,
  deposit
}; 