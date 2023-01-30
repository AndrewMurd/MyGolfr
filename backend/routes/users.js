const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { async } = require("rxjs");

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
      .withMessage("Please enter a valid email address")
      .custom(async (email) => {
        const user = await User.find(email);
        if (user.length > 0) {
          return Promise.reject("Email address already registered");
        }
      }),
    check("password")
      .trim()
      .isLength({ min: 7, max: 16 })
      .withMessage("Must be between 7 to 16 characters"),
    check("confirmPass")
      .trim()
      .custom(async (confirmPass, { req }) => {
        const password = req.body.password;

        if (password !== confirmPass) {
          return Promise.reject("Passwords must match");
        }
      }),
  ],
  async (req, res) => {
    // Create new user and store in database
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

      res.status(201).send({ msg: "User registered!", fromDatabase: result });
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
    return res.status(404).send({ type: "email" });
  }
  try {
    if (await bcrypt.compare(req.body.password, result[0].password)) {
      const user = {
        id: result[0].id,
        name: result[0].name,
        email: result[0].email,
        password: result[0].password,
      };

      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

      res.status(200).json({ accessToken: accessToken });
    } else {
      res.status(404).send({ type: "password" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
