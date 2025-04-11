// controllers/usersController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
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

    if (!username) return res.status(400).json({ message: "Username is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });
    if (!phoneNumber) return res.status(400).json({ message: "Phone Number is required" });
    if (!role) return res.status(400).json({ message: "Role is required" });

    // Validate user input
    const errors = validateUserInput(username, email, password, phoneNumber, role);
    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };// 10 minutes expiration
        await sendOTPEmail(email, otp);

        res.status(200).json({ message: "OTP sent to email for verification." });
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
   
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
        await User.create({ username, email, password: hashedPassword, phoneNumber, role });
        delete otpStore[email];
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error saving user", error });
    }
};

// Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Email not found." });

        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
        await sendOTPForgotpassword(email, otp);

        res.status(200).json({ message: "OTP sent to your email for password reset." });
    } catch (err) {
        res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
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
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "No user found with the provided email." });

        const storedOtp = otpStore[email];
        if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }
        // Hash the new password securely
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update({ password: hashedPassword }, { where: { email } });
        delete otpStore[email];
        res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




// Login user
const loginUser = async (req, res) => {
   
        const { email, password } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Validate password
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        try {
            const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
            if (!user) return res.status(401).json({ message: "Invalid email" });
    
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: "Invalid password" });
    
            const token = generateToken(user);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 30 * 60 * 1000,
            });
    
            res.status(200).json({
                message: "Login successful",
                user: { id: user.id, email: user.email, role: user.role },
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
};


// Logout user
const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};

// Update user
const updateUser = async (req, res) => {
    const { id, username, phoneNumber, role, email } = req.body;

    if (!id) return res.status(400).json({ message: "User ID is required" });

    const errors = [];
    if (username && (!/^[A-Za-z]+$/.test(username) || username.length < 3)) {
        errors.push("Username must be at least 3 characters long and contain only alphabets.");
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push("Invalid email format.");
    if (phoneNumber && !/^\d{12}$/.test(phoneNumber)) errors.push("Phone number must be 12 digits.");
    if (role && !["Admin", "Teacher"].includes(role)) errors.push("Invalid role.");

    if (errors.length > 0) return res.status(400).json({ message: "Validation failed", errors });

    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (role) updatedFields.role = role;

    try {
        const [updatedCount] = await User.update(updatedFields, { where: { id } });
        if (updatedCount === 0) {
            return res.status(404).json({ message: "User not found with the provided ID." });
        }
        res.status(200).json({ message: "User updated successfully." });
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Email already in use." });
        }
        res.status(500).json({ message: "Database error", error: err.message });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    const { id } = req.body;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: "Valid user ID is required" });
    }

    try {
        const deleted = await User.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }
        res.clearCookie("token");
        res.status(200).json({ message: "User deleted successfully and token cleared." });
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
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