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
  apiKey: "",
});



const generateQuestionsFromText = async (textpath, no_of_questions_by_difficulty) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates quiz questions from given book content. Always respond in JSON format."
        },
        {
          role: "user",
          content: `Generate ${number_of_questions} questions based on the below content.
Each question should have:
- question: string,
- options: array of 4 options (A, B, C, D),
- answer: correct option (A, B, C, or D).

Respond in this JSON format:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    },
    ...
  ]
}

Here is the content:
${text}`
        }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content); // { questions: [...] }
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
      no_of_questions_by_difficulty,
      all_questions,
      options,
      answer
    } = req.body;

    if (!book_id || !chapter_id || !topic_id || !user_id || !question_type || !no_of_questions_by_difficulty) {
      return res.status(400).json({ message: 'Please enter the required fields' });
    }

    const book = await Book.findOne({ where: { book_id } });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const textPath = path.join(__dirname, `../uploaded-books/${book.unique_name}`);
    if (!fs.existsSync(textPath)) {
      return res.status(404).json({ message: 'Book file not found' });
    }

    let text = '';
    if (book.unique_name.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(textPath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (book.unique_name.endsWith('.docx')) {
      const data = await mammoth.extractRawText({ path: textPath });
      text = data.value;
    } else if (path.extname(book.unique_name) === ".txt") {
      text = fs.readFileSync(textPath, "utf-8");
    }
    else {
      return res.status(400).json({ message: 'Unsupported file format' });
    }

    const generatedQuestions = {
      easy: await generateQuestionsFromText(text, no_of_questions_by_difficulty.easy),
      medium: await generateQuestionsFromText(text, no_of_questions_by_difficulty.medium),
      hard: await generateQuestionsFromText(text, no_of_questions_by_difficulty.hard),
    };

    if (!generatedQuestions) {
      return res.status(500).json({ message: "Failed to generate questions" });
    }

    const createdQuestions = await Promise.all(
      generatedQuestions.questions.map(item =>
        Question.create({
          book_id,
          chapter_id,
          topic_id,
          user_id,
          question_type,
          no_of_questions_by_difficulty,
          all_questions,
          options,
          answer,
        })
      )
    );

    return res.status(201).json({
      message: 'Questions created successfully',
      data: createdQuestions
    });

  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};



module.exports = { createQuestion };
