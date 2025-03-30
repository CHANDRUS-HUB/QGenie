require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const pool = require("../models/db");
const fetch = require("node-fetch");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");


// Upload Directory Setup
const uploadDir = path.join(__dirname, "../uploaded-books/");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration for Uploads
const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Invalid file type. Only PDF, DOCX, and TXT allowed."));
    },
});

// Generate Unique Book Name
const generateUniqueFileName = async (userId) => {
    const today = new Date();
    const datePart = today.toISOString().split("T")[0].replace(/-/g, "");
    const { rows } = await pool.query(
        "SELECT COUNT(*) AS count FROM books WHERE user_id = $1 AND created_at::date = CURRENT_DATE",
        [userId]
    );
    const nextNumber = String(Number(rows[0].count) + 1).padStart(3, "0");
    return `B${datePart}_${nextNumber}`;
};

// Compute SHA-256 Hash
const calculateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });
};


// Extract content from uploaded file
const extractContentFromFile = async (filePath, mimeType) => {
    if (mimeType === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } else if (mimeType.includes("wordprocessingml")) {
        const { value } = await mammoth.extractRawText({ path: filePath });
        return value;
    } else if (mimeType === "text/plain") {
        return fs.readFileSync(filePath, "utf8");
    }
    throw new Error("Unsupported file type.");
};

// Hugging Face API Analysis
// Hugging Face API Analysis
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const analyzeTextWithAI = async (text) => {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: `Extract the following details from the provided book:
                1. Total Chapters & List of Chapter Titles
                2. Total Topics under each Chapter & Topic Names
                3. Total Subtopics under each Topic & Subtopic Names
                
                Content:
                ${text.slice(0, 8000)}`
            }),
        });

        const result = await response.json();
        return result[0]?.generated_text || "AI Analysis failed.";
    } catch (error) {
        console.error("Error analyzing text:", error);
        return "Error during AI analysis.";
    }
};

// Upload Book Controller
// Upload Book Controller
const uploadBook = async (req, res) => {
    upload.single("file")(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: "File upload error." });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }
        }

        try {
            const { title = "Unknown", author = "Unknown", subject = "Unknown", class_name = "Unknown", medium = "Unknown" } = req.body;
            const userId = req.user.id;

            if (!req.file) {
                return res.status(400).json({ error: "File is required." });
            }

            const { originalname, path: tempFilePath, mimetype } = req.file;

            // ✅ Check for Duplicate (user_id + original_name)
            const { rows: duplicateCheck } = await pool.query(
                "SELECT book_id FROM books WHERE user_id = $1 AND original_name = $2",
                [userId, originalname]
            );

            if (duplicateCheck.length > 0) {
                fs.unlinkSync(tempFilePath); // Remove temporary file
                return res.status(409).json({
                    error: "Book with the same title already exists for this user.",
                });
            }

            // Extract content from uploaded file
            const bookContent = await extractContentFromFile(tempFilePath, mimetype);
            console.log("Extracted Text:", bookContent.slice(0, 500));

            // Analyze book content using AI
            const aiAnalysis = await analyzeTextWithAI(bookContent);
            console.log("AI Analysis:", aiAnalysis);

            // Parse AI Analysis to extract metadata
            const metadata = extractMetadataFromAI(aiAnalysis);

            // Calculate Content Hash
            const contentHash = await calculateFileHash(tempFilePath);

            // Check for Duplicate Content (content_hash)
            const { rows: existingBooks } = await pool.query(
                "SELECT file_path, unique_name FROM books WHERE content_hash = $1",
                [contentHash]
            );

            let finalFilePath, uniqueFileName;

            if (existingBooks.length > 0) {
                finalFilePath = existingBooks[0].file_path;
                uniqueFileName = existingBooks[0].unique_name;
                fs.unlinkSync(tempFilePath); // Remove temporary duplicate file
            } else {
                uniqueFileName = await generateUniqueFileName(userId);
                const fileExtension = path.extname(originalname);
                uniqueFileName += fileExtension;
                finalFilePath = path.join(uploadDir, uniqueFileName);
                fs.renameSync(tempFilePath, finalFilePath);
            }

            const insertQuery = `
                INSERT INTO books (title, author, subject, class_name, medium, user_id, original_name, unique_name, file_path, file_type, content_hash, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *;
            `;

            const { rows } = await pool.query(insertQuery, [
                title, author, subject, class_name, medium,
                userId, originalname, uniqueFileName, finalFilePath,
                mimetype, contentHash, metadata,
            ]);

            res.status(201).json({
                message: "Book uploaded successfully.",
                book: rows[0],
            });

        } catch (error) {
            console.error("Error uploading book:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });
};


// Helper function to extract metadata from AI analysis
const extractMetadataFromAI = (aiAnalysis) => {
    try {
        const metadata = {
            total_chapters: 0,
            chapters: [],
        };

        const chapterMatches = aiAnalysis.match(/Chapter \d+: (.+)/g) || [];
        metadata.total_chapters = chapterMatches.length;

        chapterMatches.forEach((chapter, index) => {
            const chapterName = chapter.replace(/Chapter \d+: /, '').trim();
            metadata.chapters.push({
                chapter_name: chapterName,
                total_topics: 0,
                topics: []
            });

            const topicMatches = aiAnalysis.match(new RegExp(`Chapter ${index + 1} Topics: (.+)`, 'i')) || [];
            metadata.chapters[index].total_topics = topicMatches.length;

            topicMatches.forEach((topic) => {
                metadata.chapters[index].topics.push({
                    topic_name: topic,
                    total_subtopics: 0,
                    subtopics: []
                });

                const subtopicMatches = aiAnalysis.match(new RegExp(`Topic: ${topic} Subtopics: (.+)`, 'i')) || [];
                metadata.chapters[index].topics[metadata.chapters[index].topics.length - 1].total_subtopics = subtopicMatches.length;

                subtopicMatches.forEach((subtopic) => {
                    metadata.chapters[index].topics[metadata.chapters[index].topics.length - 1].subtopics.push(subtopic);
                });
            });
        });

        return metadata;
    } catch (error) {
        console.error("Error extracting metadata:", error);
        return {};
    }
};

module.exports = { uploadBook };
