// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./router/userRoute");
const bookRouters = require("./router/bookRoute");
const path = require("path");

//database connection
const sequelize = require("./models/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// app.use(cors({
//   origin: "http://localhost:3000",  // Allow only frontend origin
//   credentials: true ,
//    methods: "GET,POST,PUT,DELETE",
// // allowedHeaders: "Content-Type,Authorization" // Allow cookies & authentication headers
// }));


app.use(cors({
  origin: (origin, callback) => {
    // If there's no origin (i.e., if the request is from a same-origin source), allow it
    if (!origin || /10\.\d+\.\d+\.\d+\:\d+/i.test(origin)) {
      callback(null, true); // Allow all IPs
    } else {
      callback(new Error('Not allowed by CORS'), false); // Reject other origins (optional, can be customized)
    }
  },
  credentials: true,  // Allow credentials like cookies to be sent
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization",  // Allow necessary headers
}));



// Sync the database
sequelize.sync({ alter: true })
  .then(() => console.log("Database & tables synced!"))
  .catch((err) => console.error("Database sync error:", err));


// Routes
app.use("/", userRoutes,bookRouters);

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

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
