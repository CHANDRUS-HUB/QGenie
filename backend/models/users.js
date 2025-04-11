// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.TEXT, allowNull: false },
  phoneNumber: { type: DataTypes.STRING(12) },
  role: {
    type: DataTypes.STRING(20),
    validate: { isIn: [['Admin', 'Teacher']] },
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
