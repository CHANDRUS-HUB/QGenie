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
    ),
    allowNull: false,
  },

 //no of question for easy
 no_of_questions_easy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
 //no of question for medium
 no_of_questions_medium: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
 //no of question for hard
 no_of_questions_hard: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  all_questions: { 
    type: DataTypes.JSONB,
    //  allowNull: false
  },
  difficulty_level: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
  },
  

  options: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    // allowNull: false,
  },

  answer: {
    type: DataTypes.JSONB,
    // allowNull: false,
  },
  question_ispublic: { type: DataTypes.BOOLEAN, defaultValue: false },

  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'questions',
  timestamps: false,
});



module.exports = Question;
