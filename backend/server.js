require("dotenv").config();

const express = require("express");

const usersRoute = require("./routes/users");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
});

app.use("/users", usersRoute);

app.listen(3000);
