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
    getAllUsers,
    resendOTP,
} = require("../controllers/usersController");

const protectRoute = require("../middleware/protectRoute");
// const {getAIResponse, uploadBook } = require("../controllers/bookController");


const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// User routes
router.get("/profile", protectRoute, getProfile);
router.get("/get-all-users", protectRoute, getAllUsers);
router.put("/update", protectRoute, updateUser);
router.delete("/delete", protectRoute, deleteUser);


// POST route for OpenAI API
// router.post("/generate", async (req, res) => {
//     try {
//       const { prompt } = req.body;
  
//       if (!prompt) {
//         return res.status(400).json({ error: "Prompt is required" });
//       }
  
//       const aiResponse = await getAIResponse(prompt);
//       res.status(200).json({ response: aiResponse });
//     } catch (error) {
//       console.error("Error in AI route:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });

module.exports = router;
