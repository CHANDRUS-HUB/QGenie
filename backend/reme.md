-- ========================================
-- 1. DROP Tables (If Exists - Ensure Clean Setup)
-- ========================================
DROP TABLE IF EXISTS sub_topics CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS book_actions CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- 2. USERS TABLE (With Constraints & CRUD)
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phoneNumber VARCHAR(12),
    role VARCHAR(20) CHECK (role IN ('Admin', 'Teacher')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Users
INSERT INTO users (username, email, password, phoneNumber, role)
VALUES 
    ('Dhush', 'maharaju1212@gmail.com', 'hashed_password', '1234567890', 'Admin'),
    ('JaneSmith', 'jane@example.com', 'hashed_password', '9876543210', 'Student');

-- Fetch All Users
SELECT * FROM users;

-- Update User Information
UPDATE users SET phoneNumber = '1112223333' WHERE id = 1;

-- Delete a User (Cascades on Related Records)
DELETE FROM users WHERE id = 1;

-- Truncate Users Table (Removes All Data)
TRUNCATE users RESTART IDENTITY CASCADE;

-- ========================================
-- 3. BOOKS TABLE (With Binary File Storage & Duplicate Check)
-- ========================================
DROP TABLE IF EXISTS books CASCADE;


CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,                 -- Unique book identifier
    title VARCHAR(255) NOT NULL,                -- Book title (required)
    author VARCHAR(255),                        -- Book author (optional)
    subject VARCHAR(255),                       -- Book subject (optional)
    class_name VARCHAR(255),                    -- Class/Grade (optional)
    medium VARCHAR(255),                        -- Language (optional)
    user_id INTEGER NOT NULL,                   -- Reference to users table
    original_name TEXT NOT NULL,                -- Original file name
    unique_name TEXT NOT NULL,                  -- Generated unique file name (B28032025_1234.pdf)
    file_path TEXT NOT NULL,                    -- Path to uploaded book
    file_type VARCHAR(255),                     -- MIME type (application/pdf, etc.)
    content_hash TEXT NOT NULL,                 -- Hash of file content (for deduplication)
    metadata JSONB,                             -- Metadata in JSON format (additional information)
    created_at TIMESTAMP DEFAULT NOW(),         -- Creation timestamp
    updated_at TIMESTAMP DEFAULT NOW(),         -- Last update timestamp
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, original_name),            -- Ensure unique file name for each user
    UNIQUE (content_hash)                       -- Ensure no duplicate file content
);
ALTER TABLE books DROP CONSTRAINT books_content_hash_key;

-- Ensure uniqueness only per user
ALTER TABLE books ADD CONSTRAINT unique_user_book UNIQUE (user_id, content_hash);

-- Ensure Unique Combination of User and Content Hash
ALTER TABLE books DROP CONSTRAINT IF EXISTS unique_user_book;
ALTER TABLE books ADD CONSTRAINT unique_user_book UNIQUE (user_id, content_hash);

-- Indexes for Fast Access
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_content_hash ON books(content_hash);
CREATE INDEX idx_books_file_path ON books(file_path);
CREATE INDEX idx_books_metadata ON books USING GIN (metadata);
-- for every book 
SELECT 
    b.book_id,
    b.title AS book_title,
    c.chapter_id,
    c.chapter_name,
    t.topic_id,
    t.topic_name,
    st.subtopic_id,
    st.subtopic_name
FROM books b
LEFT JOIN chapters c ON b.book_id = c.book_id
LEFT JOIN topics t ON c.chapter_id = t.chapter_id
LEFT JOIN sub_topics st ON t.topic_id = st.topic_id
ORDER BY b.book_id, c.chapter_id, t.topic_id, st.subtopic_id;
-- single book
SELECT 
    b.title AS book_title,
    c.chapter_name,
    t.topic_name,
    st.subtopic_name
FROM books b
LEFT JOIN chapters c ON b.book_id = c.book_id
LEFT JOIN topics t ON c.chapter_id = t.chapter_id
LEFT JOIN sub_topics st ON t.topic_id = st.topic_id
WHERE b.book_id = 1;


-- Fetch All Books
SELECT * FROM books;

-- Truncate Books Table (Removes All Data)
TRUNCATE books RESTART IDENTITY CASCADE;

-- Update Book Title
UPDATE books SET title = 'Advanced Mathematics' WHERE book_id = 1;

-- Delete a Book (Cascade Deletes in Related Tables)
DELETE FROM books WHERE book_id = 1;



-- Ensure Fast Duplicate Checks
CREATE INDEX idx_book_content_hash ON books(md5(full_content));

-- ========================================
-- 4. BOOK ACTIONS TABLE (Public/Private Status)
-- ========================================
CREATE TABLE book_actions (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    file_id INTEGER NOT NULL,
    action VARCHAR(10) CHECK (action IN ('public', 'private')),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Insert Book Action
INSERT INTO book_actions (book_id, file_id, action)
VALUES (1, 101, 'public');

-- Fetch All Actions
SELECT * FROM book_actions;

-- Update Action Status
UPDATE book_actions SET action = 'private' WHERE id = 1;

-- Delete Action Record
DELETE FROM book_actions WHERE id = 1;

-- Truncate Actions Table
TRUNCATE book_actions RESTART IDENTITY CASCADE;

-- ========================================
-- 5. CHAPTERS TABLE (Linked to Books)
-- ========================================
CREATE TABLE chapters (
    chapter_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    total_chapters INTEGER,
    chapter_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Insert Chapter
INSERT INTO chapters (book_id, total_chapters, chapter_name)
VALUES (1, 10, 'Introduction to Algebra');

-- Fetch All Chapters
SELECT * FROM chapters;

-- Update Chapter
UPDATE chapters SET chapter_name = 'Advanced Algebra' WHERE chapter_id = 1;

-- Delete Chapter
DELETE FROM chapters WHERE chapter_id = 1;

-- Truncate Chapters Table
TRUNCATE chapters RESTART IDENTITY CASCADE;

-- ========================================
-- 6. TOPICS TABLE (Linked to Chapters)
-- ========================================
CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL,
    total_topics INTEGER,
    topic_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (chapter_id) REFERENCES chapters(chapter_id) ON DELETE CASCADE
);

-- Insert Topic
INSERT INTO topics (chapter_id, total_topics, topic_name)
VALUES (1, 5, 'Quadratic Equations');

-- Fetch All Topics
SELECT * FROM topics;

-- Update Topic
UPDATE topics SET topic_name = 'Advanced Quadratics' WHERE topic_id = 1;

-- Delete Topic
DELETE FROM topics WHERE topic_id = 1;

-- Truncate Topics Table
TRUNCATE topics RESTART IDENTITY CASCADE;

-- ========================================
-- 7. SUBTOPICS TABLE (Linked to Topics)
-- ========================================
DROP TABLE IF EXISTS books CASCADE;

CREATE TABLE sub_topics (
    subtopic_id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL,
    total_subtopics INTEGER,
    subtopic_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE
);

-- Insert Subtopic
INSERT INTO sub_topics (topic_id, total_subtopics, subtopic_name)
VALUES (1, 2, 'Factoring Techniques');

-- Fetch All Subtopics
SELECT * FROM sub_topics;

-- Update Subtopic
UPDATE sub_topics SET subtopic_name = 'Advanced Factoring' WHERE subtopic_id = 1;

-- Delete Subtopic
DELETE FROM sub_topics WHERE subtopic_id = 1;

-- Truncate Subtopics Table
TRUNCATE sub_topics RESTART IDENTITY CASCADE;

-- ========================================
-- 8. Clean-Up (Ensure Consistency in Data)
-- ========================================
-- Delete a User and All Related Data
DELETE FROM users WHERE id = 1;

-- Delete a Book and All Associated Chapters, Topics, and Subtopics
DELETE FROM books WHERE book_id = 1;

-- Truncate All Tables with Cascade
TRUNCATE users, books, book_actions, chapters, topics, sub_topics RESTART IDENTITY CASCADE;

--to find the crt name in table
SELECT conname
FROM pg_constraint
WHERE conrelid = 'books'::regclass
AND contype = 'u';
