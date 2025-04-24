// models/Topic.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Chapter = require('./chapters');

const Topic = sequelize.define('Topic', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  book_id: { type: DataTypes.INTEGER, allowNull: false ,primaryKey: true },
  chapter_id: { type: DataTypes.INTEGER, allowNull: false ,primaryKey: true },
  topic_id: { type: DataTypes.INTEGER, allowNull: false,  primaryKey: true },
  topic_name: DataTypes.STRING,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'topics',
  timestamps: false,
});





module.exports = Topic;
