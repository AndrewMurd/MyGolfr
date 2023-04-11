const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const crypto = require("crypto");
const sendEmail = require("../util/sendEmail");

const router = Router();

function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

function parseData(user) {
  if (user.follows) user.follows = JSON.parse(user.follows);
  if (user.followers) user.followers = JSON.parse(user.followers);
  return user;
}

// @desc Get User
// @route GET /users/get
// @access Private
router.get("/get", async (req, res) => {
  const { id } = req.query;

  try {
    const users = await User.findId(id);

    if (users.length == 0) {
      res.status(404).send({ error: "No users were found!" });
    } else {
      res.status(200).send({ user: users[0] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// @desc Get Array of Users
// @route POST /users/getUsers
// @access Private
router.post("/getUsers", async (req, res) => {
  const { ids } = req.body;
  const users = [];

  for (const id of ids) {
    try {
      const res = await User.findId(id);
      users.push(parseData(res[0]));
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
  res.status(200).send({ users: users });
});

// @desc Search users table in database
// @route GET /users/search
// @access Public
router.get("/search", async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.search(query);

    if (users.length == 0) {
      res.status(404).send({ error: "No users were found!" });
    } else {
      for (const user of users) {
        parseData(user);
      }
      res.status(200).send({ users: users });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// @desc Register user
// @route GET /users/signup
// @access Public
router.post(
  "/signup",
  [
    check("name")
      .trim()
      .isLength({ min: 4, max: 40 })
      .withMessage("Must be between 4 to 40 characters"),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .custom(async (email) => {
        const users = await User.find(email);
        if (users.length > 0) {
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

// @desc update user
// @route POST /users/update
// @access Public
router.post("/update", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { user } = req.body;

  try {
    await User.update(user);
    console.log(`Updating user: ${user.id}`);
  } catch (error) {
    console.log(error);
  }

  res.json({ user: user });
});

// @desc update follows
// @route POST /users/follows
// @access Public
router.post("/follows", async (req, res) => {
  const { id, follows } = req.body;

  try {
    await User.updateFollows(id, JSON.stringify(follows));
    console.log(`Updating follows for: ${id}`);
  } catch (error) {
    console.log(error);
  }

  res.end();
});

// @desc update followers
// @route POST /users/followers
// @access Public
router.post("/followers", async (req, res) => {
  const { id, followers } = req.body;

  try {
    await User.updateFollowers(id, JSON.stringify(followers));
    console.log(`Updating followers for: ${id}`);
  } catch (error) {
    console.log(error);
  }

  res.end();
});

// @desc update user name
// @route POST /users/name
// @access Public
router.post(
  "/name",
  [
    check("name")
      .trim()
      .isLength({ min: 4, max: 40 })
      .withMessage("Must be between 4 to 40 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id, name } = req.body;

    try {
      await User.updateName(id, name);
      console.log(`Updating name for: ${id}`);
    } catch (error) {
      console.log(error);
    }

    res.end();
  }
);

// @desc update user
// @route POST /users/email
// @access Public
router.post(
  "/email",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .custom(async (email) => {
        const users = await User.find(email);
        if (users.length > 0) {
          return Promise.reject("Email address already registered");
        }
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id, email } = req.body;

    try {
      await User.updateEmail(id, email);
      console.log(`Updating email for: ${id}`);
    } catch (error) {
      console.log(error);
    }

    res.end();
  }
);

// @desc update user password
// @route POST /users/password
// @access Private
router.post(
  "/password",
  [
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updatePassword(id, hashedPassword);
      console.log(`Updating password for: ${id}`);
    } catch (error) {
      console.log(error);
    }

    res.end();
  }
);

// @desc send email to user for password reset
// @route POST /users/forgot_password
// @access Public
router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const users = await User.find(email);
    if (users.length == 0)
      return res.status(404).json({ error: "Email could not be sent" });

    const token = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const currentDateTime = new Date();
    await User.updateToken(
      hashedToken,
      new Date(currentDateTime.getTime() + 600000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
      email
    );

    const resetUrl = `${process.env.URL}password-reset/${token}`;
    const message = `
    <h1>You have requested a password reset</h1>
    <p>Please go to this link to reset your password</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  `;

    try {
      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      console.log(error);
      await User.updateToken(null, null, email);
      return res.status(500).send({ error: "Internal Email Server Error" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// @desc reset Password
// @route GET /users/reset_password
// @access Public
router.post(
  "/reset_password",
  [
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
    const { password, token } = req.body;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    try {
      const users = await User.findToken(resetPasswordToken);
      // check whether token is in database (valid)
      if (users.length == 0)
        return res.status(400).json({ type: "token", error: "Invalid Token" });
      // check if token has expired
      if (
        new Date().getTime() >
        convertUTCDateToLocalDate(new Date(users[0].resetTokenExpiry)).getTime()
      ) {
        await User.updateToken(null, null, users[0].email);
        return res
          .status(400)
          .json({ type: "expired", error: "Expired Token" });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // set password in database
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updatePassword(users[0].id, hashedPassword);
      console.log(`Updating password for user: ${users[0].id}`);
      await User.updateToken(null, null, users[0].email);

      res.status(200).json({ success: true, data: "Password Reset" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ type: "server", error: "Internal Server Error" });
    }
  }
);

module.exports = router;
