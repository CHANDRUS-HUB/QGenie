const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { Book, Chapter, Topic, Question, User } = require('../models/association');

const pdfParse = require("pdf-parse");
require("dotenv").config();
const { Op } = require("sequelize");

const uploadDir = path.join(__dirname, "../uploaded-books/");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 20 * 1024 * 1024 },
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


const generateUniqueFileName = async (userId, contentHash) => {
  // 1. Check if user already uploaded this content before
  const existing = await Book.findOne({
    where: {
      user_id: userId,
      content_hash: contentHash,
    },
  });

  if (existing) {
    // If same user and same content, reuse unique name
    return existing.unique_name;
  }

  // 2. Else: count total number of *unique* uploads today (global, not per user)
  const today = new Date();
  const datePart = today.toISOString().split("T")[0].replace(/-/g, "");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const count = await Book.count({
    where: {
      created_at: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  const nextNumber = String(count + 1).padStart(3, "0");
  return `Q${datePart}_${nextNumber}`;
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

const OpenAI = require("openai");
const mammoth = require("mammoth");
const openai = new OpenAI({
  apiKey: '',
});
const extractMetadataFromFile = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let text = "";
    if (ext === ".docx" || ext === ".doc") {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (ext === ".txt") {
      text = fs.readFileSync(filePath, "utf-8");
    } else {
      throw new Error("Unsupported file type. Only PDF, Word documents, and TXT files are allowed.");
    }
    const wordCount = text.trim().split(/\s+/).length;
    console.log("Word count:", wordCount);
    console.log("Extracted text length:", text.length);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You're an expert in book analysis. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: `Analyze the book content and return a JSON object with the following format:
  {
    "title": "...", 
    "medium": "English or Tamil or any other languages — identify the language of the content", 
    "totalChapters": 0, 
    "chapters": [
      { 
        "chapterName": "...", 
        "topics": ["...", "..."] 
      },
      ...
    ],
    "totalTopics": 0, 
   
  }
  
  Here is the book content:
  ${text}
  `}
      ],
      temperature: 0.2,
    });



    console.log("OpenAI response:", response.choices[0].message.content);
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Metadata extraction error:", error);
   
    return null;
  }
};

// const ensureUniqueOriginalName = async (userId, originalName) => {
//     let counter = 1;
//     let uniqueName = originalName;

//     while (true) {
//         const existing = await Book.findOne({
//             where: { user_id: userId, original_name: uniqueName },
//         });
//         if (!existing) break;

//         const ext = path.extname(originalName);
//         const base = path.basename(originalName, ext);
//         uniqueName = `${base}_${counter}${ext}`;
//         counter++;
//     }

//     return uniqueName;
// };

const uploadBook = async (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Max size is 20 MB." });
      }
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title, subject, class_name, medium, total_chapters ,Book__ispublic} = req.body;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: "File  are required." });
      }
      if (!subject) {

        return res.status(400).json({ error: "subject is required." });
      }
      if (!class_name) {
        return res.status(400).json({ error: "class_name is required." });
      }

        // Convert Book__ispublic to boolean if it's a string
        const isPublic = Book__ispublic === "true";

        // Define whether the book is public or private
        if (Book__ispublic === undefined) {
      return res.status(400).json({ error: "Book__ispublic is required." });
        }
        if (typeof isPublic !== "boolean") {
      return res.status(400).json({ error: "Book__ispublic must be a boolean value." });
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

        // Use existing book metadata
        metadata = existingBook.metadata 
        ? (typeof existingBook.metadata === "string" ? JSON.parse(existingBook.metadata) : existingBook.metadata)
        : {
            title: existingBook.title,
            medium: existingBook.medium,
          };
      
      } else {
        uniqueFileName = await generateUniqueFileName(userId, contentHash);
        const ext = path.extname(originalName);
        uniqueFileName += ext;
        finalFilePath = path.join(uploadDir, uniqueFileName);
        fs.renameSync(tempFilePath, finalFilePath);

        metadata = await extractMetadataFromFile(finalFilePath);

        if (!metadata) {
          // Cleanup the uploaded file if it exists
          if (fs.existsSync(finalFilePath)) {
        fs.unlinkSync(finalFilePath);
          }

          return res.status(400).json({
        error: "Failed to upload the file. Minimum 12,000–12,300 words are accessible.",
          });
        }
      }
      // const finalOriginalName = await ensureUniqueOriginalName(userId, originalName);

      const [book, created] = await Book.findOrCreate({
        where: {
          user_id: userId,
          content_hash: contentHash,
        },
        defaults: {
          title: metadata?.title || title,
          subject,
          class_name,
          medium: metadata?.medium || medium,
          total_chapters: metadata?.totalChapters || total_chapters,
          user_id: userId,
          original_name: originalName,
          unique_name: uniqueFileName,
          file_path: finalFilePath,
          file_type: fileType,
          content_hash: contentHash,
          metadata: metadata,
          book_ispublic: isPublic,
        },
      });

      if (!created) {
        return res.status(200).json({
          message: "Duplicate book detected. Using existing record.",
          book_id: book.book_id,
        });
      }
      await insertChaptersFromMetadata(book.book_id, metadata);
      // Loop over each chapter to insert topics
      if (metadata?.chapters?.length > 0) {
        for (let i = 0; i < metadata.chapters.length; i++) {
          await insertTopicsFromMetadata(book.book_id, i + 1, metadata);
        }
      }

      res.status(201).json({
        message: "Book uploaded successfully.",
        book,
        book_id: book.book_id,
        
      });

    } catch (error) {
      console.error("Error uploading book:", error);
      res.status(500).json({ 
       error:error.message || "Something went wrong while uploading the book.",
      });
    }
  });
};

//chapter entry automatic
async function insertChaptersFromMetadata(book_id, metadata) {
  if (!metadata || !Array.isArray(metadata.chapters)) return;

  const existingChapters = await Chapter.findAll({ where: { book_id } });
  if (existingChapters.length > 0) return;

  const chaptersToInsert = metadata.chapters.map((chapterEntry, index) => {
    const chapterName = typeof chapterEntry === "string" ? chapterEntry : chapterEntry.chapterName;
    const topics = typeof chapterEntry === "object" ? chapterEntry.topics?.length || 0 : 0;
    return {
      book_id,
      chapter_id: index + 1,
      chapter_name: chapterName,
      total_Topics: topics,
    };
  });

  await Chapter.bulkCreate(chaptersToInsert);
}
//topic entry automatic
async function insertTopicsFromMetadata(book_id, chapter_id, metadata) {
  if (!metadata || !Array.isArray(metadata.chapters)) return;
  const chapter = metadata.chapters[chapter_id - 1];
  if (!chapter || !Array.isArray(chapter.topics)) return;
  const existingTopics = await Topic.findAll({ where: { book_id, chapter_id } });
  if (existingTopics.length > 0) return;
  const topicsToInsert = chapter.topics.map((topicEntry, index) => {
    return {
      book_id,
      chapter_id,
      topic_id: index + 1,
      topic_name: topicEntry,
    };
  });
  await Topic.bulkCreate(topicsToInsert);
}

//chapter entry manual

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


const getBooksByUserIdandpublic = async (req, res) => {
  try {
    const userId = req.user.id;

    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { user_id: userId }, // Books uploaded by the user
          { book_ispublic: true }, // Public books
        ],
      },
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


//get all books by user id where the user uploaded books with chapters with topics
const getBooksByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { user_id: userId }, // Books uploaded by the user
          // { book_ispublic: true }, // Public books
        ],
      },
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

//get all books which are public that is true
const getPublicBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { book_ispublic: true },
      include: [
        {
          model: Chapter,
          include: [Topic],
        },
      ],
    });

    res.status(200).json({ books });
  } catch (error) {
    console.error("Error fetching public books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get book by book id
const getBookById = async (req, res) => {
  try {
    const { book_id } = req.params;

    if (!book_id) {
      return res.status(400).json({ error: "book_id is required" });
    }

    const book = await Book.findOne({
      where: { book_id },
      include: [
        {
          model: Chapter,
          include: [Topic],
        },
      ],
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found for the given book_id" });
    }

    res.status(200).json({ book });
  } catch (error) {
    console.error("Error fetching book by ID:", error.message || error);
    res.status(500).json({ error: "Something went wrong while fetching the book." });
  }
};

//current user can update the book which are uploaded by him
const updateBookByCurrentUser = async (req, res) => {
  try {
    const { book_id } = req.body;
    const { title, subject, class_name, medium,book_ispublic } = req.body;

    if (!book_id) {
      return res.status(400).json({ error: "book id is required" });
    }

    const book = await Book.findOne({ where: { book_id } });

    if (!book) {
      return res.status(404).json({ error: "Book not found for the given book_id" });
    }

    // Update the book details
    await book.update({
      title,
      subject,
      class_name,
      medium,
      book_ispublic,
    });

    res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error("Error updating book:", error.message || error);
    res.status(500).json({ error: "Something went wrong while updating the book." });
  }
};

//get all  chapter by book id
const getChaptersByBookId = async (req, res) => {
  try {
    const { book_id } = req.params;

    if (!book_id) {
      return res.status(400).json({ error: "book_id is required" });
    }

    const chapters = await Chapter.findAll({
      where: { book_id },
      include: [Topic],
    });

    if (!chapters) {
      return res.status(404).json({ error: "Chapters not found for the given book_id" });
    }

    res.status(200).json({ chapters });
  } catch (error) {
    console.error("Error fetching chapters by book ID:", error.message || error);
    res.status(500).json({ error: "Something went wrong while fetching the chapters." });
  }
};
//get all topics by book id and chapter id
const getTopicsByBookIdAndChapterId = async (req, res) => {
  try {
    const { book_id, chapter_id } = req.params;

    if (!book_id || !chapter_id) {
      return res.status(400).json({ error: "book_id and chapter_id are required" });
    }

    const topics = await Topic.findAll({
      where: { book_id, chapter_id },
    });

    if (!topics) {
      return res.status(404).json({ error: "Topics not found for the given book_id and chapter_id" });
    }

    res.status(200).json({ topics });
  } catch (error) {
    console.error("Error fetching topics by book ID and chapter ID:", error.message || error);
    res.status(500).json({ error: "Something went wrong while fetching the topics." });
  }
};

module.exports = { uploadBook, chapterEntry, getAllBooks, getBooksByUserId, topicEntry, getBookById , updateBookByCurrentUser, getPublicBooks, getChaptersByBookId, getTopicsByBookIdAndChapterId,getBooksByUserIdandpublic};
