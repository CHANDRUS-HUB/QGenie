// // models/BookAction.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('./db');
// const Book = require('./book');

// const BookAction = sequelize.define('BookAction', {
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//   book_id: { type: DataTypes.INTEGER, allowNull: false },
 
//   action: {
//     type: DataTypes.STRING(10),
//     validate: { isIn: [['public', 'private']] }
//   },
//   created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
// }, {
//   tableName: 'book_actions',
//   timestamps: false,
// });

// Book.hasMany(BookAction, { foreignKey: 'book_id', onDelete: 'CASCADE' });
// BookAction.belongsTo(Book, { foreignKey: 'book_id' });

// module.exports = BookAction;
