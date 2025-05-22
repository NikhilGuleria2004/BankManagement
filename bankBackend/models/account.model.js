const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  type: {
    type: DataTypes.ENUM('savings', 'checking', 'business'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'frozen'),
    defaultValue: 'active'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Define associations
Account.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Account, { foreignKey: 'userId' });

module.exports = Account; 