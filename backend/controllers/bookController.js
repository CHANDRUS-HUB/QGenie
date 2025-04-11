const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const axios = require("axios");
const  Book  = require("../models/book"); // Sequelize model
const Chapter = require("../models/chapters"); // Sequelize model
const Topic=require('../models/topics')

const uploadDir = path.join(__dirname, "../uploaded-books/");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF, DOCX, and TXT allowed."));
        }
    },
});

const generateUniqueFileName = async (userId) => {
    const today = new Date();
    const datePart = today.toISOString().split("T")[0].replace(/-/g, "");

    const count = await Book.count({
        where: {
            user_id: userId,
            created_at: new Date().toISOString().split("T")[0],
        },
    });

    const nextNumber = String(count + 1).padStart(3, "0");
    return `B${datePart}_${nextNumber}`;
};

const calculateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });
};

// const extractMetadataFromFile = async (filePath) => {
//     try {
//         const fileContent = fs.readFileSync(filePath, "utf-8");
//         const response = await axios.post("http://localhost:11434", {
//             model: "mistral",
//             prompt: `Extract the chapters, topics and from the following content:\n\n${fileContent}`,
//         });
//         return response.data?.extractedMetadata || {};
//     } catch (error) {
//         console.error("Error extracting metadata using Ollama:", error);
//         return {};
//     }
// };

const ensureUniqueOriginalName = async (userId, originalName) => {
    let counter = 1;
    let uniqueName = originalName;

    while (true) {
        const existing = await Book.findOne({
            where: { user_id: userId, original_name: uniqueName },
        });
        if (!existing) break;

        const ext = path.extname(originalName);
        const base = path.basename(originalName, ext);
        uniqueName = `${base}_${counter}${ext}`;
        counter++;
    }

    return uniqueName;
};

const uploadBook = async (req, res) => {
    upload.single("file")(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ error: "File too large. Max size is 20 MB." });
            }
            return res.status(400).json({ error: err.message });
        }

        try {
            const { title, author, subject, class_name, medium ,total_chapters,metadata} = req.body;
            const userId = req.user.id;

            if (!req.file || !title) {
                return res.status(400).json({ error: "File and title are required." });
            }

            const originalName = req.file.originalname;
            const tempFilePath = req.file.path;
            const fileType = req.file.mimetype;

            const contentHash = await calculateFileHash(tempFilePath);

            const existingBook = await Book.findOne({ where: { content_hash: contentHash } });

            let finalFilePath, uniqueFileName;

            if (existingBook) {
                finalFilePath = existingBook.file_path;
                uniqueFileName = existingBook.unique_name;
                fs.unlinkSync(tempFilePath);
            } else {
                uniqueFileName = await generateUniqueFileName(userId);
                const ext = path.extname(originalName);
                uniqueFileName += ext;
                finalFilePath = path.join(uploadDir, uniqueFileName);
                fs.renameSync(tempFilePath, finalFilePath);
            }

            // const metadata = await extractMetadataFromFile(finalFilePath);
            const finalOriginalName = await ensureUniqueOriginalName(userId, originalName);

            const [book, created] = await Book.findOrCreate({
                where: {
                    user_id: userId,
                    content_hash: contentHash,
                },
                defaults: {
                    title,
                    author,
                    subject,
                    class_name,
                    medium,
                    total_chapters,
                    user_id: userId,
                    original_name: finalOriginalName,
                    unique_name: uniqueFileName,
                    file_path: finalFilePath,
                    file_type: fileType,
                    content_hash: contentHash,
                    metadata,
                },
            });

            if (!created) {
                return res.status(200).json({
                    message: "Duplicate book detected. Using existing record.",
                });
            }

            res.status(201).json({
                message: "Book uploaded successfully.",
                book,
            });

        } catch (error) {
            console.error("Error uploading book:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });
};
//get all books in the data base with chapters and topics
const getAllBooks = async (req, res) => {
    try {
      const books = await Book.findAll({
        include: [
          {
            model: Chapter,
            include: [Topic],
          },
        ],
      });
  
      res.status(200).json({ books });
    } catch (error) {
      console.error("Error fetching all books:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
//get all books by user id where the user uploaded books with chapters with topics
const getBooksByUserId = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const books = await Book.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Chapter,
            include: [Topic],
          },
        ],
      });
  
      res.status(200).json({ books });
    } catch (error) {
      console.error("Error fetching books by user ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
//chapter entry

const chapterEntry = async (req, res) => {
    try {
      const { book_id, chapter_name, total_Topics } = req.body;
  
      if (!book_id) {
        return res.status(400).json({ error: "book_id is required" });
      }
      if (!chapter_name) {
        return res.status(400).json({ error: "chapter_name is required" });
      }
  
      const book = await Book.findByPk(book_id);
      if (!book) {
        return res.status(404).json({ error: "Book not found for the given book_id" });
      }
  
      // Find the highest chapter_id for the book
      const lastChapter = await Chapter.findOne({
        where: { book_id },
        order: [['chapter_id', 'DESC']],
      });
  
      const nextChapterId = lastChapter ? lastChapter.chapter_id + 1 : 1;
  
      const chapter = await Chapter.create({
        book_id,
        chapter_id: nextChapterId,
        chapter_name,
        total_Topics,
      });
  
      res.status(201).json({
        message: "Chapter entry created successfully.",
        chapter_id: nextChapterId,
        chapter,
      });
  
    } catch (error) {
      console.error("Error creating chapter entry:", error);
      res.status(500).json({
        error: "Something went wrong while creating the chapter.",
        details: error.message || error,
      });
    }
  };
  

  //topic entry

  const topicEntry = async (req, res) => {
    try {
      const { book_id, chapter_id, topic_name } = req.body;
  
      // Individual field checks
      if (!book_id) {
        return res.status(400).json({ error: "book_id is required" });
      }
      if (!chapter_id) {
        return res.status(400).json({ error: "chapter_id is required" });
      }
      if (!topic_name) {
        return res.status(400).json({ error: "topic_name is required" });
      }
  
      // Check if chapter exists
      const chapter = await Chapter.findOne({
        where: { book_id, chapter_id },
      });
  
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found for the given book_id and chapter_id" });
      }
  
      // Get the highest topic_id for this chapter
      const lastTopic = await Topic.findOne({
        where: { book_id, chapter_id },
        order: [['topic_id', 'DESC']],
      });
  
      const nextTopicId = lastTopic ? lastTopic.topic_id + 1 : 1;
  
      const topic = await Topic.create({
        book_id,
        chapter_id,
        topic_id: nextTopicId,
        topic_name,
      });
  
      res.status(201).json({
        message: "Topic entry created successfully.",
        topic_id: nextTopicId,
        topic,
      });
  
    } catch (error) {
      console.error("Error creating topic entry:", error.message);
      res.status(500).json({
        error: "Something went wrong while creating the topic.",
        details: error.message,
      });
    }
  };
  
  
  module.exports = { uploadBook, chapterEntry, getAllBooks, getBooksByUserId,topicEntry };
