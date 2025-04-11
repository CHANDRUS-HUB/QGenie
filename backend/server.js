// server.js
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("./router/userRoute");
const bookRouters = require("./router/bookRoute");

//database connection
const sequelize = require("./models/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());



// Sync the database
sequelize.sync({ alter: true })
  .then(() => console.log("Database & tables synced!"))
  .catch((err) => console.error("Database sync error:", err));


// Routes
app.use("/", userRoutes,bookRouters);

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
