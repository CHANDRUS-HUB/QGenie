const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Book = require('./book');
const Chapter = require('./chapters');
const Topic = require('./topics');
const User = require('./users');

const Question = sequelize.define('Question', {
  question_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  chapter_id: { type: DataTypes.INTEGER, allowNull: false },
  topic_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  question_type: {
    type: DataTypes.ENUM(
      'objective',
      'fill_in_the_blanks',
      'match_the_following',
      'logical_reasoning',
      'descriptive',
      'comprehension'
    ),
    allowNull: false,
  },

  difficulty_level: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
  },

  question_text: { type: DataTypes.TEXT,
    //  allowNull: false
     },

  number_of_questions: {
    type: DataTypes.INTEGER,
    // allowNull: false,
    defaultValue: 1, // usually 1 per row, unless bulk logic needed
  },

  options: {
    type: DataTypes.JSONB, // null for descriptive, comprehension
    allowNull: true,
  },

  answer: {
    type: DataTypes.JSONB,
    // allowNull: false,
  },

  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'questions',
  timestamps: false,
});

// Associations
Book.hasMany(Question, { foreignKey: 'book_id', onDelete: 'CASCADE' });
Question.belongsTo(Book, { foreignKey: 'book_id' });

Chapter.hasMany(Question, { foreignKey: 'chapter_id', onDelete: 'CASCADE' });
Question.belongsTo(Chapter, { foreignKey: 'chapter_id' });

Topic.hasMany(Question, { foreignKey: 'topic_id', onDelete: 'CASCADE' });
Question.belongsTo(Topic, { foreignKey: 'topic_id' });

User.hasMany(Question, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Question.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Question;
