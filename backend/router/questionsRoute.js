const express = require("express");
const router = express.Router();


const {createQuestion, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion, getPublicQuestions} = require("../controllers/questionsController");
const protectRoute = require("../middleware/protectRoute");


// Route to create a new question
router.post("/create-question",protectRoute, createQuestion);
// Route to get all questions
router.get("/get-all-questions",protectRoute, getAllQuestions);
//route to get all public questions
 router.get("/get-all-public-questions",protectRoute, getPublicQuestions);
// Route to get a question by ID
router.get("/get-question/:id",protectRoute, getQuestionById);
// Route to update a question
router.put("/update-question/:id",protectRoute, updateQuestion);
// Route to delete a question
router.delete("/delete-question/:id",protectRoute, deleteQuestion);
// Route to get questions by user ID    



module.exports = router;