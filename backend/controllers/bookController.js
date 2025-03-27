const db = require("../models/db");
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Use memory storage to keep files in RAM
const upload = multer({ storage: multer.memoryStorage() });

const extractTextFromFile = async (file) => {
    try {
        if (file.mimetype === 'text/plain') {
            return file.buffer.toString('utf8');
        } else if (file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(file.buffer);
            return pdfData.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value: docxText } = await mammoth.extractRawText({ buffer: file.buffer });
            return docxText;
        } else {
            throw new Error('Unsupported file type. Only .txt, .pdf, and .docx are allowed.');
        }
    } catch (error) {
        throw new Error('Error extracting text from file: ' + error.message);
    }
};

const uploadBook = async (req, res) => {
    const { title, author, subject, class_name, medium, user_id } = req.body;

    if (!req.file || !user_id) {
        return res.status(400).json({ message: "File and user ID are required." });
    }

    try {
        // Extract content from the file stored in memory
        const full_content = await extractTextFromFile(req.file);

        // Insert book into the database
        const result = await db.query(
            `INSERT INTO books (title, author, subject, class_name, medium, user_id, full_content) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, author, subject, class_name, medium, user_id, full_content]
        );

        const book = result.rows[0];

        res.status(201).json({ message: "Book uploaded and processed successfully.", book });
    } catch (error) {
        console.error("Error uploading book:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = { upload, uploadBook };
