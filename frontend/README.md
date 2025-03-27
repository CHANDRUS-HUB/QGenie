CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phoneNumber VARCHAR(12),
    role VARCHAR(20) CHECK (role IN ('Admin', 'Teacher', 'Student')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




INSERT INTO users (username, email, password, phoneNumber, role)
VALUES 
('JohnDoe', 'john@example.com', 'hashed_password', 1234567890, 'Admin'),
('JaneSmith', 'jane@example.com', 'hashed_password', 9876543210, 'Student');
Select * from users;
SHOW COLUMNS FROM users;
DELETE FROM users WHERE id = 1;
truncate table users;

