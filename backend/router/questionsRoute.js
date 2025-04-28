const express = require("express");
const router = express.Router();


const {createQuestion, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion} = require("../controllers/questionsController");


// Route to create a new question
router.post("/create-question", createQuestion);



module.exports = router;