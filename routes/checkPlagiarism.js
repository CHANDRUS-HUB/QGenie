const express = require('express');
const router = express.Router();
const { checkPlagiarism, getQuestions } = require('../controllers/plagiarismController');


router.post('/', checkPlagiarism);
router.get('/questions',getQuestions);

module.exports = router;
