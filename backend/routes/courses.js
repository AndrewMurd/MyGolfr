const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { async } = require("rxjs");

const router = Router();

router.post(async (req, res) => {
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

module.exports = router;
