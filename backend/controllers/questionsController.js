const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { Book, Chapter, Topic, Question, User } = require('../models/association');

const pdfParse = require("pdf-parse");
require("dotenv").config();
const { Op } = require("sequelize");






const OpenAI = require("openai");
const mammoth = require("mammoth");
const openai = new OpenAI({
  apiKey: '',
  baseURL: 'https://openrouter.ai/api/v1',
});


function buildPrompt(text, question_type, totalQuestions) {
  let format;

  switch (question_type) {
    case 'short_answer':
    case 'long_answer':
    case 'fill_in_the_blanks':
      format = `{
  "questions": [
    {
  "question_diifficulty_level": "...",
      "question": "...",
      "answer": "..."
    }
  ]
}`;
      break;

    default: // multiple_choice, true_or_false, etc.
      format = `{
  "questions": [
    {
      "question_diifficulty_level": "...",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}`;
      break;
  }

  return `Generate ${totalQuestions} ${question_type.replace(/_/g, ' ')} questions based on the below content.

Respond in this JSON format:
${format}

Here is the content:
${text}`;
}

const generateQuestionsFromText = async (text, question_type, no_of_questions_easy, no_of_questions_medium, no_of_questions_hard) => {
  try {
    const totalQuestions = no_of_questions_easy + no_of_questions_medium + no_of_questions_hard;
    const prompt = buildPrompt(text, question_type, totalQuestions);

    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates quiz questions from given book content. Always respond in JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    console.log("Generated Questions:", content);
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating questions:", error);
    return null;
  }
};


const createQuestion = async (req, res) => {
  try {
    const {
      book_id,
      chapter_id,
      topic_id,
      user_id,
      question_type,
      no_of_questions_easy,
      no_of_questions_medium,
      no_of_questions_hard
    } = req.body;

    if (
      !book_id || !Array.isArray(chapter_id) || !chapter_id.length ||
      !Array.isArray(topic_id) || !topic_id.length ||
      !user_id || !question_type ||
      no_of_questions_easy == null || no_of_questions_medium == null || no_of_questions_hard == null
    ) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

  

    const book = await Book.findOne({ where: { book_id } });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const textPath = path.join(__dirname, `../uploaded-books/${book.unique_name}`);
    if (!fs.existsSync(textPath)) return res.status(404).json({ message: 'Book file not found' });

    let text = '';
    if (book.unique_name.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(textPath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (book.unique_name.endsWith('.docx')) {
      const data = await mammoth.extractRawText({ path: textPath });
      text = data.value;
    } else if (book.unique_name.endsWith('.txt')) {
      text = fs.readFileSync(textPath, "utf-8");
    } else {
      return res.status(400).json({ message: 'Unsupported file format' });
    }

    const result = await generateQuestionsFromText(text, question_type,no_of_questions_easy , no_of_questions_medium , no_of_questions_hard);
    if (!result || !result.questions || result.questions.length === 0) {
      return res.status(500).json({ message: "Failed to generate questions" });
    }

    const pairs = chapter_id.map((chId, index) => ({
      chId,
      tpId: topic_id[index % topic_id.length]
    })); // Map chapter IDs to topic IDs

    const createdQuestions = [];
    for (let i = 0; i < result.questions.length; i++) {
      const q = result.questions[i];
      const { chId, tpId } = pairs[i % pairs.length]; // Distribute evenly
    
      const data = {
        book_id,
        chapter_id: chId,
        topic_id: tpId,
        user_id,
        question_type,
        no_of_questions_easy,
        no_of_questions_medium,
        no_of_questions_hard,
        all_questions: q.question,
        difficulty_level: q.question_difficulty_level,
        answer: q.answer,
        created_at: new Date(),
        updated_at: new Date()
      };
    
      if (!['short_answer', 'long_answer', 'fill_in_the_blanks'].includes(question_type)) {
        data.options = q.options;
      }
    
      const created = await Question.create(data);
      createdQuestions.push(created);
    }
    return res.status(201).json({
      message: 'Questions created successfully',
      data: createdQuestions
    });

  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ message: 'Failed to generate questions', error });
  }
};


module.exports = { createQuestion };
