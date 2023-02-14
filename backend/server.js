require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require('cookie-parser');
const corsOptions = require("./config/corsOptions");
// const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// app.use(
//   session({
//     secret: process.env.ACCESS_TOKEN_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

app.use("/users", require("./routes/userRoutes"));
app.use("/courses", require("./routes/courseRoutes"));
app.use("/google", require("./routes/googleAPIRoutes"));
app.use("/auth", require("./routes/authRoutes"));

app.listen(PORT, console.log(`Server Running on port ${PORT}`));
