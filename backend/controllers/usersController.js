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
    db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, results) => {
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
            `INSERT INTO users (username, email, password, phoneNumber, role) VALUES (?, ?, ?, ?, ?)`,
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

    db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, results) => {
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
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!otp) return res.status(400).json({ message: "OTP is required" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    const storedOtp = otpStore[email];
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.query(
            `UPDATE users SET password = ? WHERE email = ?`,
            [hashedPassword, email],
            (err) => {
                if (err) return res.status(500).json({ message: "Database error", err });
                delete otpStore[email];
                res.status(200).json({ message: "Password reset successfully." });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
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
    verifyOTP,
    loginUser,
    logoutUser,
    getProfile,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword,
};