// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./router/userRoute");
const bookRouters = require("./router/bookRoute");
const questionROutes=require('./router/questionsRoute')
const path = require("path");

//database connection
const sequelize = require("./models/db");

dotenv.config();

const app = express();
const port =  7000;

// Middleware
app.use(express.json());
app.use(cookieParser());





app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost:3000 and any IPs matching the regex
    if (!origin || /10\.\d+\.\d+\.\d+\:\d+/i.test(origin) || origin === "http://localhost:3000") {
      callback(null, true); // Allow the origin
    } else {
      callback(new Error("Not allowed by CORS")); // Reject other origins
    }
  },
  credentials: true,  // Allow credentials like cookies to be sent
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization",  // Allow necessary headers
}));


app.use("/", userRoutes,bookRouters,questionROutes);




// Routes


const buildPath = path.join(__dirname, "../Frontend/build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  try {
    res.sendFile(path.join(buildPath, "index.html"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Sync the database
sequelize.sync({ alter: true })
  .then(() => console.log("Database & tables synced!"))
  .catch((err) => console.error("Database sync error:", err));


app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
