const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Book = require('./book');
const Topic = require('./topics');

const Chapter = sequelize.define('Chapter', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  book_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  chapter_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true }, //chapter is can start for each from 1
  chapter_name: DataTypes.STRING,
  total_Topics: DataTypes.INTEGER,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'chapters',
  timestamps: false,
});

Book.hasMany(Chapter, {
  foreignKey: 'book_id',
  onDelete: 'CASCADE',
  hooks: true, // 🟢 Required for Sequelize-level cascading
});
Chapter.belongsTo(Book, { foreignKey: 'book_id' });
Chapter.hasMany(Topic, {
  foreignKey: 'chapter_id',
  onDelete: 'CASCADE',
  hooks: true, // 🟢 Required for Sequelize-level cascading
});
Topic.belongsTo(Chapter, { foreignKey: 'chapter_id' });
module.exports = Chapter;
