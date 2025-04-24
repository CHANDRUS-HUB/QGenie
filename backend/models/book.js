// models/Book.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const User = require('./users');



const Book = sequelize.define('Book', {
  book_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, },
  subject: DataTypes.STRING,
  class_name: DataTypes.STRING,
  medium: DataTypes.STRING,
  total_chapters: DataTypes.INTEGER,
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  original_name: { type: DataTypes.TEXT, allowNull: false },
  unique_name: { type: DataTypes.TEXT, allowNull: false },
  file_path: { type: DataTypes.TEXT, allowNull: false },
  file_type: DataTypes.STRING,
  content_hash: { type: DataTypes.TEXT, allowNull: false },
  metadata: DataTypes.JSONB,
  book_ispublic: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'books',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['content_hash'] },
    { fields: ['file_path'] },
    { using: 'GIN', fields: ['metadata'] }
  ],
});

User.hasMany(Book, { foreignKey: 'user_id', onDelete: 'CASCADE' });

Book.belongsTo(User, { foreignKey: 'user_id' });

// boook belongs to book_actions


module.exports = Book;
