const { getAllQuestions, addQuestion } = require('../models/questionModel');
const { getEmbedding, cosineSimilarity } = require('../services/similarityService');

const checkPlagiarism = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question text is required.' });
    }
    // if (question.trim().split(' ').length < 4) {
    //     return res.status(400).json({ error: 'Please enter a more descriptive question.' });
    //   }
      
    const normalizeText = (question) => {
        return question.toLowerCase().replace(/\s+/g, ' ').trim();
      };
      
      const normalizedQuestion = normalizeText(question);
      const inputEmbedding = await getEmbedding(normalizedQuestion);

          if (!inputEmbedding) {
      return res.status(500).json({ error: 'Failed to get embedding for input question.' });
    }
    

    const existingQuestions = await getAllQuestions();
    let isPlagiarized = false;
    const similarityThreshold = 0.7;

    const similarityResults = [];

    for (const q of existingQuestions) {
      const existingEmbedding = await getEmbedding(q.question_text);

      if (!existingEmbedding) continue;

      const similarity = cosineSimilarity(inputEmbedding, existingEmbedding);
      const isMatch = similarity >= similarityThreshold;

      similarityResults.push({
        id: q.id,
        question_text: q.question_text,
        similarity: similarity.toFixed(4),
        isPlagiarized: isMatch,
      });

      if (isMatch) isPlagiarized = true;
    }

    if (!isPlagiarized) {
        try {
          await addQuestion(question);
        } catch (error) {
          console.error("❌ Error inserting question:", error.message);
        }
      }
      

    res.json({
      message: isPlagiarized
        ? '❌ Plagiarism detected. Question not saved.'
        : '✅ No plagiarism detected. Question saved.',
      similarity_results: similarityResults,
    });
  } catch (error) {
    console.error('Error in checkPlagiarism:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getQuestions=async (req, res) => {
  try {
    const questions = await getAllQuestions();
    res.json({ questions });
  } catch (error) {
    console.error('❌ Error retrieving questions:', error.message);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};
module.exports = { checkPlagiarism,getQuestions };
