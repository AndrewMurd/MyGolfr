require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { logger } = require("./backend/middleware/logger");
const cookieParser = require("cookie-parser");
const corsOptions = require("./backend/config/corsOptions");
const path = require("path");

const fs = require("fs");
const file = fs.readFileSync("./996719CF19C662CA1222D420016BAD3E.txt");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(__dirname + "/dist/my-golfr"));

app.use("/backend/users", require("./backend/routes/userRoutes"));
app.use("/backend/courses", require("./backend/routes/courseRoutes"));
app.use("/backend/google", require("./backend/routes/googleAPIRoutes"));
app.use("/backend/auth", require("./backend/routes/authRoutes"));
app.use("/backend/scores", require("./backend/routes/scoreRoutes"));

app.get(
  "/.well-known/pki-validation/996719CF19C662CA1222D420016BAD3E.txt",
  (req, res) => {
    res.sendFile(__dirname + "/996719CF19C662CA1222D420016BAD3E.txt");
  }
);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/my-golfr/index.html"));
});

app.listen(PORT, console.log(`Server Running on port ${PORT}`));
