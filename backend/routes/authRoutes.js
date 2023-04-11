const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const loginLimiter = require("../middleware/loginLimiter");
const cookieParser = require("cookie-parser");

const router = Router();

router.use(cookieParser());

function parsedDataToUser(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    favCourses: JSON.parse(data.favCourses),
    hdcp: data.hdcp,
    follows: JSON.parse(data.follows),
    followers: JSON.parse(data.followers),
  };
}

// @desc Login
// @route POST /auth/login
// @access Public
router.post("/login", loginLimiter, async (req, res) => {
  // Authenticate existing user
  try {
    const result = await User.find(req.body.email);

    if (result.length == 0) return res.status(404).send({ type: "email" });

    if (await bcrypt.compare(req.body.password, result[0].password)) {
      const user = parsedDataToUser(result[0]);

      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true, // accessible only by web server
        secure: true, // https
        sameSite: "None", // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry
      });
      res.json({ accessToken });
    } else {
      res.status(404).send({ type: "password" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// @desc Refresh access token
// @route GET /auth/refresh
// @access Public
router.get("/refresh", async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      try {
        const result = await User.find(decoded.email);
        if (result.length == 0)
          return res.status(401).json({ message: "Unauthorized" });
        const user = parsedDataToUser(result[0]);

        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });

        res.json({ accessToken });
      } catch (error) {
        res.status(404).json({ message: "Connection Error" });
      }
    }
  );
});

// @desc Logout
// @route Post /auth/logout
// @access Public
router.post("/logout", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
});

module.exports = router;
