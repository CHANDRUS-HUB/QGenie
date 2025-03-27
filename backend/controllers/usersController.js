// controllers/usersController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const nodemailer = require("nodemailer");
const { validateUserInput } = require("./utils/validators");

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "30m",
    });
};

// Email sender configuration
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper function to send OTP via email
const sendOTPEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "QGenie - Email Verification for Signup",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Welcome to QGenie!</h2>
                <p>Thank you for signing up. Please use the following OTP to verify your account:</p>
                <h3 style="color: #4CAF50;">${otp}</h3>
                <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best regards,</p>
                <p>The QGenie Team</p>
            </div>
        `,
    };
    return transporter.sendMail(mailOptions);
};

const sendOTPForgotpassword = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "QGenie - Password Reset Request",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Password Reset Request</h2>
                <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
                <h3 style="color: #4CAF50;">${otp}</h3>
                <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                <p>If you did not request this, please ignore this email or contact support.</p>
                <br>
                <p>Best regards,</p>
                <p>The QGenie Team</p>
            </div>
        `,
    };
    return transporter.sendMail(mailOptions);
};

// Generate random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP temporarily
const otpStore = {};

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, phoneNumber, role } = req.body;

    if(!username) return res.status(400).json({ message: "Username is required" });
    if(!email) return res.status(400).json({ message: "Email is required" });
    if(!password) return res.status(400).json({ message: "Password is required" });
    if(!phoneNumber) return res.status(400).json({ message: "Phone Number is required" });
    if(!role) return res.status(400).json({ message: "Role is required" });

    // Validate user input
    const errors = validateUserInput(username, email, password, phoneNumber, role);
    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    // Check if user already exists
    db.query(`SELECT * FROM users WHERE email = $1`, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", err });
        if (results.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        try {
            // Send OTP for email verification
            const otp = generateOTP();
            otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // OTP valid for 10 mins
            await sendOTPEmail(email, otp);
            res.status(200).json({ message: "OTP sent to email for verification." });
        } catch (error) {
            res.status(500).json({ message: "Error sending OTP", error });
        }
    });
};

// Verify OTP and save user
const verifyOTP = async (req, res) => {
    const { username, email, password, phoneNumber, role, otp } = req.body;

    const storedOtp = otpStore[email];
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            `INSERT INTO users (username, email, password, phoneNumber, role) VALUES ($1, $2, $3, $4, $5)`,
            [username, email, hashedPassword, phoneNumber, role],
            (err) => {
                if (err) return res.status(500).json({ message: "Database error", err });
                delete otpStore[email]; // Clear OTP after successful registration
                res.status(201).json({ message: "User registered successfully." });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Error saving user", error });
    }
};

// Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    db.query(`SELECT * FROM users WHERE email = $1`, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", err });
        if (results.length === 0) {
            return res.status(404).json({ message: "Email not found." });
        }

        try {
            const otp = generateOTP();
            otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
            await sendOTPForgotpassword(email, otp);
            res.status(200).json({ message: "OTP sent to your email for password reset." });
        } catch (error) {
            res.status(500).json({ message: "Error sending OTP", error });
        }
    });
};

// Reset Password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const errors = [];

    // Input validation
    if (!email) {
        errors.push("Email is required.");
    }
    if (!otp) {
        errors.push("OTP is required.");
    }
    if (!newPassword) {
        errors.push("New password is required.");
    } else if (newPassword.length < 6 || !/\d/.test(newPassword)) {
        errors.push("Password must be at least 6 characters long and contain at least one number.");
    }

    // If there are validation errors, return all of them
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Ensure the provided email exists in the database
        const userResult = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: "No user found with the provided email." });
        }

        // Validate OTP
        const storedOtp = otpStore[email];
        if (!storedOtp) {
            return res.status(400).json({ message: "OTP not generated for this email." });
        }
        if (storedOtp.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }
        if (Date.now() > storedOtp.expiresAt) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        // Hash the new password securely
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        const updateResult = await db.query(
            `UPDATE users SET password = $1 WHERE email = $2`,
            [hashedPassword, email]
        );

        // Confirm that the password was updated
        if (updateResult.rowCount === 0) {
            return res.status(500).json({ message: "Failed to update password. Please try again." });
        }

        // Clear OTP after successful password reset
        delete otpStore[email];

        res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Validate password
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Sanitize and normalize email
        const sanitizedEmail = email.trim().toLowerCase();

        // Fetch user from database
        const query = "SELECT * FROM users WHERE email = $1";
        const { rows } = await db.query(query, [sanitizedEmail]);

        // Check if email exists
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email" });
        }

        const user = rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Set HttpOnly cookie for better security
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookie in production
            sameSite: "Strict", // Helps prevent CSRF attacks
            maxAge: 30 * 60 * 1000, // 30 minutes
        });

        return res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, role: user.role },
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Logout user
const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};

// Update user
const updateUser = (req, res) => {
    const { id, username, phoneNumber, role, email } = req.body;

    // Check if the user ID is provided
    if (!id) {
        return res.status(400).json({ message: "User ID is required to update the user." });
    }

    // Collect validation errors
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
    if (role && !["Admin", "Teacher"].includes(role)) {
        errors.push("Invalid role. Allowed values: Admin, Teacher.");
    }

    // Return validation errors (if any)
    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    // Prepare dynamic SQL query for updating only provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1; // Start index for parameterized query

    if (username) {
        updates.push(`username = $${paramIndex++}`);
        values.push(username);
    }

    if (email) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
    }

    if (phoneNumber) {
        updates.push(`phoneNumber = $${paramIndex++}`);
        values.push(phoneNumber);
    }

    if (role) {
        updates.push(`role = $${paramIndex++}`);
        values.push(role);
    }

    // Ensure at least one field is provided for update
    if (updates.length === 0) {
        return res.status(400).json({
            message: "At least one field (username, email, phoneNumber, role) is required to update.",
        });
    }

    // Finalize query and values array (add ID at the end)
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`;
    values.push(id);

    // Execute database query
    db.query(query, values, (err, result) => {
        if (err) {
            // Handle duplicate email error (PostgreSQL specific)
            if (err.code === "23505") {
                return res.status(400).json({ message: "Email already in use by another user." });
            }
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        // Handle case where no rows were updated (invalid ID)
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found with the provided ID." });
        }

        res.status(200).json({ message: "User updated successfully." });
    });
};


// Delete user
const deleteUser = (req, res) => {
    const { id } = req.body;

    // Validate ID
    if (!id) {
        return res.status(400).json({ message: "User ID is required to delete the user." });
    }

    // Ensure ID is a number (basic validation)
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format." });
    }

    // Query to delete the user
    db.query(`DELETE FROM users WHERE id = $1`, [userId], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        // If no user was deleted, handle non-existent ID
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "User not found with the provided ID." });
        }

        // Clear the auth token cookie (optional)
        res.clearCookie("token");

        res.status(200).json({ message: "User deleted successfully and token cleared." });
    });
};


// Get user profile (protected route)
const getProfile = (req, res) => {
    res.json({ message: "User profile", user: req.user });
};

module.exports = {
    registerUser,
    verifyOTP,
    loginUser,
    logoutUser,
    getProfile,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword,
};