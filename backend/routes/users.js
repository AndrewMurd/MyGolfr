const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const router = Router();

router.post(
  "/signup",
  [
    check("name")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Must be 4 characters long"),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (email) => {
        const user = await User.find(email);
        if (user.length > 0) {
          return Promise.reject("Email address already registered");
        }
      }),
    check("password")
      .trim()
      .isLength({ min: 7 })
      .withMessage("Must be 7 characters long"),
  ],
  async (req, res) => {
    // Authenticate new user
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const userDetails = {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      };

      const result = await User.save(userDetails);
      console.log("from server", result);

      res.status(201).send("User registered!");
    } catch (error) {
      console.log("Error with registering user!");
      res.status(500).send(error);
    }
  }
);

router.post("/login", async (req, res) => {
  // Authenticate existing user
  const result = await User.find(req.body.email);

  if (result.length == 0) {
    return res.status(404).send("Cannot find user!");
  }
  try {
    if (await bcrypt.compare(req.body.password, result[0].password)) {
      res.status(200).send("Logged In User");
    } else {
      res.send("This password does not match!");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
