const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Account = require('./account.model');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'reversed'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sourceAccountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Account,
      key: 'id'
    }
  },
  destinationAccountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Account,
      key: 'id'
    }
  }
});

// Define associations
Transaction.belongsTo(Account, { as: 'sourceAccount', foreignKey: 'sourceAccountId' });
Transaction.belongsTo(Account, { as: 'destinationAccount', foreignKey: 'destinationAccountId' });
Account.hasMany(Transaction, { as: 'outgoingTransactions', foreignKey: 'sourceAccountId' });
Account.hasMany(Transaction, { as: 'incomingTransactions', foreignKey: 'destinationAccountId' });

module.exports = Transaction; 