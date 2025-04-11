// models/Topic.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Chapter = require('./chapters');

const Topic = sequelize.define('Topic', {
  topic_id: { type: DataTypes.INTEGER, allowNull: false,  primaryKey: true },
  book_id: { type: DataTypes.INTEGER, allowNull: false ,primaryKey: true },
  chapter_id: { type: DataTypes.INTEGER, allowNull: false ,primaryKey: true },
  topic_name: DataTypes.STRING,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'topics',
  timestamps: false,
});

Chapter.hasMany(Topic, { foreignKey: 'chapter_id', onDelete: 'CASCADE' });
Topic.belongsTo(Chapter, { foreignKey: 'chapter_id' });

module.exports = Topic;
