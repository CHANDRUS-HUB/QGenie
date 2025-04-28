const express = require("express");

const protectRoute = require("../middleware/protectRoute");
const { uploadBook,chapterEntry, getAllBooks, getBooksByUserId, topicEntry, getBookById, updateBookByCurrentUser, getPublicBooks } = require("../controllers/bookController");
const router = express.Router();

router.get('/get-all-books',protectRoute,  getAllBooks);
router.get('/get-all-publicbooks',protectRoute,  getPublicBooks);

router.get('/get-books-by-user', protectRoute,getBooksByUserId);
// GET route for getting a book by its ID
router.get('/get-book-by-bookid/:book_id', protectRoute,getBookById);


// POST route for uploading a book
router.post("/upload-book", protectRoute, uploadBook);

//put route for updating a book
router.put("/update-book-currentUser", protectRoute, updateBookByCurrentUser);



router.post("/chapter-entry", protectRoute, chapterEntry);
router.post('/topic-entry', protectRoute,topicEntry);



module.exports = router;