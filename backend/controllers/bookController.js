
const db = require("../models/db");

const uploadBook = async (req, res) => {
    const { title, author, subject, class_name, medium, user_id, full_content } = req.body;

    if ( !full_content || !user_id) {
        return res.status(400).json({ message: "Title, content, and user ID are required." });
    }

    try {
        // Insert book into the database
        const result = await db.query(
            `INSERT INTO books (title, author, subject, class_name, medium, user_id, full_content) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, author, subject, class_name, medium, user_id, full_content]
        );

        const book = result.rows[0];

        // Analyze content with AI (Assuming you call an AI model here)
        const bookStructure = await analyzeBookWithAI(full_content);

        // Store AI metadata
        await db.query(
            `UPDATE books SET metadata = $1 WHERE book_id = $2`,
            [JSON.stringify(bookStructure), book.book_id]
        );

        // Populate chapters, topics, subtopics tables
        await saveBookStructure(book.book_id, bookStructure);

        res.status(201).json({ message: "Book uploaded and processed successfully.", book });
    } catch (error) {
        console.error("Error uploading book:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { uploadBook };
