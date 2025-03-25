// router/userRoute.js
const express = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateUser,
    deleteUser,
} = require("../controllers/usersController");
const protectRoute = require("../middleware/protectRoute");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protectRoute,logoutUser);
router.get("/profile", protectRoute, getProfile);
router.put("/update", protectRoute, updateUser);
router.delete("/delete", protectRoute, deleteUser);

module.exports = router;
