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


function buildPrompt(text, question_type, no_of_questions_easy, no_of_questions_medium, no_of_questions_hard) {
  let format;

  switch (question_type) {
    case 'short_answer':
    case 'long_answer':
    case 'fill_in_the_blanks':
      format = `{
        
  "questions": [
    {
      "question_difficulty_level": "easy|medium|hard",
      "question": "Your question here",
      "answer": "Your answer here"
    }
  ]
}`;
      break;

    case 'true_or_false':
      format = `{
  "questions": [
    {
      "question_difficulty_level": "easy|medium|hard",
      "question": "Your question here",
      "options": ["True", "False"],
      "answer": "True"
    }
  ]
}`;
      break;

    case 'multiple_choice':
      format = `{
  "questions": [
    {
      "question_difficulty_level": "easy|medium|hard",
      "question": "Your question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}`;
      break;

    case 'match_the_following':
      format = `{
  "questions": [
    {
      "question_difficulty_level": "easy|medium|hard",
      "question": "Match the following items.",
      "pairs": [
        { "left": "Item 1", "right": "Match A" },
        { "left": "Item 2", "right": "Match B" }
      ]
    }
  ]
}`;
      break;

    case 'logical_reasoning':
      format = `{
  "questions": [
    {
      "question_difficulty_level": "easy|medium|hard",
      "question": "Your logical reasoning question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B"
    }
  ]
}`;
      break;

    default:
      throw new Error(`Unsupported question type: ${question_type}`);
  }

  return `You are a JSON generator bot. You must respond ONLY with a valid JSON — no explanations, no headings, no markdown, no plain text.

  Generate questions of type "${question_type.replace(/_/g, ' ')}" from the content below with the following distribution:
  - ${no_of_questions_easy} easy questions
  - ${no_of_questions_medium} medium questions
  - ${no_of_questions_hard} hard questions
  
  Respond only using this JSON format:
  ${format}
  
  Content:
  ${text}`;
}

const generateQuestionsFromText = async (text, question_type, no_of_questions_easy, no_of_questions_medium, no_of_questions_hard) => {
  try {

    const prompt = buildPrompt(text, question_type, no_of_questions_easy, no_of_questions_medium, no_of_questions_hard);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", content: `You are a JSON generator bot. Your only job is to generate quiz questions in JSON format from provided content. 
          Never include explanations, formatting, markdown, or any non-JSON text. Your response must always be a valid JSON object.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    console.log("Generated Questions:", content);
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON object found in the response.");
    }
    const jsonString = content.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
    console.log("Raw AI response:\n", content);

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
      question_type,
      no_of_questions_easy,
      no_of_questions_medium,
      no_of_questions_hard,
      question_ispublic,
    } = req.body;

    const user_id = req.user.id; // Assuming user ID is passed in the request body or obtained from the authenticated user
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

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

    const result = await generateQuestionsFromText(text, question_type, no_of_questions_easy, no_of_questions_medium, no_of_questions_hard);
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
        question_ispublic,
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


//get all question 
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        { model: Book, as: 'Book' },
        { model: Chapter, as: 'Chapter' },
        { model: Topic, as: 'Topic' },
        { model: User, as: 'User' }
      ]
    });
    return res.status(200).json({ message: 'Questions fetched successfully', data: questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ message: 'Failed to fetch questions', error });
  }
};
//get public question
const getPublicQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { question_ispublic: true },
      include: [
        { model: Book, as: 'Book' },
        { model: Chapter, as: 'Chapter' },
        { model: Topic, as: 'Topic' },
        { model: User, as: 'User' }
      ]
    });
    return res.status(200).json({ message: 'Public questions fetched successfully', data: questions });
  } catch (error) {
    console.error('Error fetching public questions:', error);
    return res.status(500).json({ message: 'Failed to fetch public questions', error });
  }
}

//get question by id
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findOne({
      where: { id },
      include: [
        { model: Book, as: 'book' },
        { model: Chapter, as: 'chapter' },
        { model: Topic, as: 'topic' },
        { model: User, as: 'user' }
      ]
    });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    return res.status(200).json({ message: 'Question fetched successfully', data: question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return res.status(500).json({ message: 'Failed to fetch question', error });
  }
};

//get all question by current user
const getAllQuestionsByUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    const questions = await Question.findAll({
      where: { user_id },
      include: [
        { model: Book, as: 'book' },
        { model: Chapter, as: 'chapter' },
        { model: Topic, as: 'topic' },
        { model: User, as: 'user' }
      ]
    });
    return res.status(200).json({ message: 'Questions fetched successfully', data: questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ message: 'Failed to fetch questions', error });
  }
};
//get all question by book id
const getAllQuestionsByBookId = async (req, res) => {
  try {
    const { book_id } = req.params;
    const questions = await Question.findAll({
      where: { book_id },
      include: [
        { model: Book, as: 'book' },
        { model: Chapter, as: 'chapter' },
        { model: Topic, as: 'topic' },
        { model: User, as: 'user' }
      ]
    });
    return res.status(200).json({ message: 'Questions fetched successfully', data: questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ message: 'Failed to fetch questions', error });
  }
};
//update questions by current user
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_type, no_of_questions_easy, no_of_questions_medium, no_of_questions_hard } = req.body;

    const question = await Question.findOne({ where: { id } });
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await Question.update(
      { question_type, no_of_questions_easy, no_of_questions_medium, no_of_questions_hard },
      { where: { id } }
    );

    return res.status(200).json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({ message: 'Failed to update question', error });
  }
};
//delete question by current user 
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findOne({ where: { id } });
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await Question.destroy({ where: { id } });
    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ message: 'Failed to delete question', error });
  }
};

module.exports = { createQuestion, 
  getAllQuestions, 
  getQuestionById, 
  getAllQuestionsByUser, 
  getAllQuestionsByBookId, 
  updateQuestion, 
  deleteQuestion ,
  getPublicQuestions};
