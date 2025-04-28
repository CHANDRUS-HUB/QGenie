// models/associations.js

const Book = require('./book');
const Chapter = require('./chapters');
const Topic = require('./topics');
const Question = require('./questiontable');
const User = require('./users');

// ==========================
// Book Associations
// ==========================

// Book belongs to User
Book.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(Book, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Book has many Chapters
Book.hasMany(Chapter, { foreignKey: 'book_id', onDelete: 'CASCADE', hooks: true });
Chapter.belongsTo(Book, { foreignKey: 'book_id' });

// Book has many Questions
Book.hasMany(Question, { foreignKey: 'book_id', onDelete: 'CASCADE' });
Question.belongsTo(Book, { foreignKey: 'book_id' });

// ==========================
// Chapter Associations
// ==========================

// Chapter belongs to Book (already done above)

// Chapter has many Topics
Chapter.hasMany(Topic, { foreignKey: 'chapter_id', onDelete: 'CASCADE', hooks: true });
Topic.belongsTo(Chapter, { foreignKey: 'chapter_id' });

// Chapter has many Questions
Chapter.hasMany(Question, { foreignKey: 'chapter_id', onDelete: 'CASCADE' });
Question.belongsTo(Chapter, { foreignKey: 'chapter_id' });

// ==========================
// Topic Associations
// ==========================

// Topic belongs to Chapter (already done above)

// Topic has many Questions
Topic.hasMany(Question, { foreignKey: 'topic_id', onDelete: 'CASCADE' });
Question.belongsTo(Topic, { foreignKey: 'topic_id' });

// ==========================
// User Associations
// ==========================

// User has many Books (already done above)

// User has many Questions
User.hasMany(Question, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Question.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  Book,
  Chapter,
  Topic,
  Question,
  User
};
