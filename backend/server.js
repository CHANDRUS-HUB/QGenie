// server.js
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("./router/userRoute");
require("./models/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", userRoutes);

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
