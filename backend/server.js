require("dotenv").config();

const express = require("express");
const cors = require('cors');

const usersRoute = require("./routes/users");
const googleRoute = require("./routes/googleAPI.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
});

app.use("/users", usersRoute);
app.use("/", googleRoute);

app.listen(3000);
