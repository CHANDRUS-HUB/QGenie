const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const Book = require('./book');
const Chapter = require('./chapters');
const Topic = require('./topics');
const User = require('./users');

const Question = sequelize.define('question', {
  question_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  chapter_id: { type: DataTypes.INTEGER, allowNull: false },
  topic_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },

  question_type: {
    type: DataTypes.ENUM(
      'fill_in_the_blanks',
      'match_the_following',
      'logical_reasoning',
      'short_answer',
      'long_answer',
      'true_or_false',
      'multiple_choice',
      'comprehension'
    ),
    allowNull: false,
  },


 no_of_questions_by_difficulty: {
    type: DataTypes.JSON, // Use JSON to store the question breakdown by difficulty
    defaultValue: { easy: 1, medium: 1, hard: 1 }, // Default breakdown (all set to 0)
    allowNull: false, // Ensure the column is always populated
  },

  all_questions: { 
    type: DataTypes.JSONB,
    //  allowNull: false
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



module.exports = Question;
