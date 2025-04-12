const Question = require('../models/questiontable');

const createQuestion = async (req, res) => {
  try {
    const {
      book_id,
      chapter_id,
      topic_id,
      user_id,
      question_type,
      difficulty_level,
      question_text,
      number_of_questions,
      options,
      answer
    } = req.body;

    // Basic validation
    if (!book_id || !chapter_id || !topic_id || !user_id || !question_type || !difficulty_level || number_of_questions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the question
    const newQuestion = await Question.create({
      book_id,
      chapter_id,
      topic_id,
      user_id,
      question_type,
      difficulty_level,
      question_text,
      number_of_questions: number_of_questions || 1,
      options: options || null,
      answer
    });

    return res.status(201).json({
      message: 'Questions created successfully',
      data: newQuestion
    });

  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = { createQuestion };
