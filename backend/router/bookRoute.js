const express = require("express");

const protectRoute = require("../middleware/protectRoute");
const { uploadBook,chapterEntry, getAllBooks, getBooksByUserId, topicEntry, getBookById, updateBookByCurrentUser, getPublicBooks, getChaptersByBookId, getTopicsByBookIdAndChapterId, getBooksByUserIdandpublic, deleteBookByCurrentUser, getBooksBychoosenUserId } = require("../controllers/bookController");
const router = express.Router();

router.get('/get-all-books',protectRoute,  getAllBooks);
router.get('/get-all-publicbooks',protectRoute,  getPublicBooks);

router.get('/get-books-by-user', protectRoute,getBooksByUserId);

router.get('/get-books-by-choosen-user/:user_id', protectRoute,getBooksBychoosenUserId);



router.get('/get-books-by-user-publicbooks', protectRoute,getBooksByUserIdandpublic);

router.get('/get-book-by-bookid/:book_id', protectRoute,getBookById);

router.get('/get-chapters/:book_id', protectRoute,getChaptersByBookId);

router.get('/get-multiple-topics', protectRoute,getTopicsByBookIdAndChapterId);


router.post("/upload-book", protectRoute, uploadBook);

router.put("/update-book-currentUser", protectRoute, updateBookByCurrentUser);

//delete book by current user
router.delete("/delete-book-currentUser/:book_id", protectRoute,deleteBookByCurrentUser);



router.post("/chapter-entry", protectRoute, chapterEntry);
router.post('/topic-entry', protectRoute,topicEntry);



module.exports = router;