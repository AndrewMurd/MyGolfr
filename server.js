require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { logger } = require("./backend/middleware/logger");
const cookieParser = require("cookie-parser");
const corsOptions = require("./backend/config/corsOptions");
const path = require("path");
const fs = require("fs");
const https = require("https");

const key = fs.readFileSync("./cert/private.key");
const cert = fs.readFileSync("./cert/certificate.crt");

const app = express();
// const PORT = process.env.PORT || 3000;
const PORT = 3000;

const cred = {
  key: key,
  cert: cert,
};

app.get("/.well-known/pki-validation/A668539B3206B7050D9D790098238867.txt", (req, res) => {
  res.sendFile("/Users/andre/Documents/PersonalProjects/MyGolfrProject/MyGolfr/SSL/A668539B3206B7050D9D790098238867.txt");
});

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

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/my-golfr/index.html"));
});

app.listen(PORT, console.log(`Server Running on port ${PORT}`));

const httpsServer = https.createServer(cred, app);
httpsServer.listen(8443);