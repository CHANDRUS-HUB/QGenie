// router/userRoute.js
const express = require("express");
const {
    registerUser,
    verifyOTP,
    loginUser,
    logoutUser,
    getProfile,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword,
} = require("../controllers/usersController");

const protectRoute = require("../middleware/protectRoute");
const { uploadBook } = require("../controllers/bookController");


const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// User routes
router.get("/profile", protectRoute, getProfile);
router.put("/update", protectRoute, updateUser);
router.delete("/delete", protectRoute, deleteUser);

// Book routes
router.post("/upload-book", protectRoute, uploadBook);

module.exports = router;
