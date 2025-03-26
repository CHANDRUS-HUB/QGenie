CREATE DATABASE QGenie;

USE QGenie;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phoneNumber BIGINT,
    role ENUM('Admin', 'Teacher', 'Student') DEFAULT 'Student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD COLUMN username VARCHAR(255) NOT NULL AFTER id;

INSERT INTO users (username, email, password, phoneNumber, role)
VALUES 
('JohnDoe', 'john@example.com', 'hashed_password', 1234567890, 'Admin'),
('JaneSmith', 'jane@example.com', 'hashed_password', 9876543210, 'Student');
Select * from users;
SHOW COLUMNS FROM users;
DELETE FROM users WHERE id = 1;
truncate table users;

