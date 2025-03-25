// controllers/usersController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { validateUserInput } = require("./utils/validators");

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "30m",
    });
};



// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, phoneNumber, role } = req.body;

    // Validate user input
    const errors = validateUserInput(username, email, password, phoneNumber, role);
    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    // Check if user already exists
    db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", err });
        if (results.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        try {
            // Hash password and save user
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query(
                `INSERT INTO users (username, email, password, phoneNumber, role) VALUES (?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, phoneNumber, role],
                (err) => {
                    if (err) return res.status(500).json({ message: "Database error", err });
                    res.status(201).json({ message: "User registered successfully" });
                }
            );
        } catch (error) {
            res.status(500).json({ message: "Error hashing password", error });
        }
    });
};

// Login user
const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", err });

        // If email not found, show specific error
        if (results.length === 0) {
            return res.status(401).json({ message: "Email does not exist" });
        }

        const user = results[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Generate and set JWT token in HttpOnly cookie
        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV ===  "production" ? true : false,
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, role: user.role },
        });
    });
};

// Logout user
const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};

// Update user
const updateUser = (req, res) => {
    const { id, username, phoneNumber, role, email } = req.body;

    if (!id) {
        return res.status(400).json({ message: "User ID is required to update the user." });
    }

    // Custom validation logic
    const errors = [];

    // Validate username (at least 3 characters and alphabets only)
    if (username && (!/^[A-Za-z]+$/.test(username) || username.trim().length < 3)) {
        errors.push("Username must be at least 3 characters long and contain only alphabets.");
    }

    // Validate email format
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push("Invalid email format.");
    }

    // Validate phoneNumber (exactly 12 digits)
    if (phoneNumber && !/^\d{12}$/.test(phoneNumber)) {
        errors.push("Phone number must be exactly 12 digits.");
    }

    // Validate role (only Admin, Teacher, Student allowed)
    if (role && !["Admin", "Teacher", "Student"].includes(role)) {
        errors.push("Invalid role. Allowed values: Admin, Teacher, Student.");
    }

    // Return validation errors (if any)
    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    // Prepare dynamic SQL query for updating only provided fields
    const updates = [];
    const values = [];

    if (username) {
        updates.push("username = ?");
        values.push(username);
    }

    if (email) {
        updates.push("email = ?");
        values.push(email);
    }

    if (phoneNumber) {
        updates.push("phoneNumber = ?");
        values.push(phoneNumber);
    }

    if (role) {
        updates.push("role = ?");
        values.push(role);
    }

    // Ensure at least one field is provided for update
    if (updates.length === 0) {
        return res.status(400).json({ message: "At least one field (username, email, phoneNumber, role) is required to update." });
    }

    // Finalize query and values array
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    values.push(id);

    // Execute database query
    db.query(query, values, (err, result) => {
        if (err) {
            // Handle duplicate email error
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ message: "Email already in use by another user." });
            }
            return res.status(500).json({ message: "Database error", err });
        }

        // Handle case where no rows were updated (invalid ID)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found with the provided ID." });
        }

        res.json({ message: "User updated successfully" });
    });
};

// Delete user
const deleteUser = (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "User ID is required to delete the user." });
    }

    db.query(`DELETE FROM users WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", err });
        }

        // Handle case where no rows were deleted (invalid ID)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found with the provided ID." });
        }

        // Clear the token cookie after user deletion
        res.clearCookie("token");
        res.json({ message: "User deleted successfully and token cleared." });
    });
};

// Get user profile (protected route)
const getProfile = (req, res) => {
    res.json({ message: "User profile", user: req.user });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateUser,
    deleteUser,
};
