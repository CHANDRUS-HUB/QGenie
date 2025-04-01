const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const pool = require("../models/db");

// Set upload directory path
const uploadDir = path.join(__dirname, "../uploaded-books/");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer (File Upload Middleware)
const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 25 * 1024 * 1024 }, // 20 MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",                                    // PDF files
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
            "text/plain",                                         // TXT files
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF, DOCX, and TXT allowed."));
        }
    },
});


// Generate a unique book name (BYYYYMMDD_001 format)
const generateUniqueFileName = async (userId) => {
    const today = new Date();
    const datePart = today.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD

    // Count today's uploads for this user
    const { rows } = await pool.query(
        "SELECT COUNT(*) AS count FROM books WHERE user_id = $1 AND created_at::date = CURRENT_DATE",
        [userId]
    );

    const nextNumber = String(Number(rows[0].count) + 1).padStart(3, "0"); // 001, 002, etc.
    return `B${datePart}_${nextNumber}`;
};

// Compute SHA-256 hash for the uploaded file
const calculateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);

        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
    });
};

// Upload Book Controller
const uploadBook = async (req, res) => {
    // Use Multer upload and handle errors
    upload.single("file")(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ error: "File too large. Max size is 20 MB." });
                }
                return res.status(400).json({ error: "File upload error." });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }
        }

        try {
            const { title, author, subject, class_name, medium } = req.body;
            const userId = req.user.id;

            // Validate required fields
            if (!req.file || !title) {
                return res.status(400).json({ error: "File and title are required." });
            }

            const originalName = req.file.originalname;
            const tempFilePath = req.file.path;
            const fileType = req.file.mimetype;

            // Compute SHA-256 content hash for deduplication
            const contentHash = await calculateFileHash(tempFilePath);

            // Check if the content already exists (across any user)
            const { rows: existingBooks } = await pool.query(
                "SELECT file_path, unique_name FROM books WHERE content_hash = $1",
                [contentHash]
            );

            let finalFilePath, uniqueFileName;

            if (existingBooks.length > 0) {
                // File already exists – reuse the stored path
                finalFilePath = existingBooks[0].file_path;
                uniqueFileName = existingBooks[0].unique_name;
                fs.unlinkSync(tempFilePath); // Delete the uploaded temp file
            } else {
                // Generate a new unique filename
                uniqueFileName = await generateUniqueFileName(userId);
                const fileExtension = path.extname(originalName);
                uniqueFileName += fileExtension;
                finalFilePath = path.join(uploadDir, uniqueFileName);

                // Move the file to the permanent directory
                fs.renameSync(tempFilePath, finalFilePath);
            }

            // Ensure unique original_name for the user
            const ensureUniqueOriginalName = async (userId, originalName) => {
                let counter = 1;
                let uniqueName = originalName;

                while (true) {
                    const { rowCount } = await pool.query(
                        "SELECT 1 FROM books WHERE user_id = $1 AND original_name = $2",
                        [userId, uniqueName]
                    );

                    if (rowCount === 0) break;

                    // If name exists, append a counter to make it unique
                    const ext = path.extname(originalName);
                    const base = path.basename(originalName, ext);
                    uniqueName = `${base}_${counter}${ext}`;
                    counter++;
                }

                return uniqueName;
            };

            // Ensure original name is unique for the current user
            const finalOriginalName = await ensureUniqueOriginalName(userId, originalName);

            // Insert book record into the database
            const insertQuery = `
                INSERT INTO books (title, author, subject, class_name, medium, user_id, original_name, unique_name, file_path, file_type, content_hash)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (user_id, content_hash) DO NOTHING
                RETURNING *;
            `;

            const { rows } = await pool.query(insertQuery, [
                title,
                author,
                subject,
                class_name,
                medium,
                userId,
                finalOriginalName,
                uniqueFileName,
                finalFilePath,
                fileType,
                contentHash,
            ]);

            if (rows.length === 0) {
                return res.status(200).json({
                    message: "Duplicate book detected. Using existing record.",
                });
            }

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



module.exports = {  uploadBook };
