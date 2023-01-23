module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.header["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("You have no token!");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send("This token is invalid!");
    req.user = user;
    next();
  });
};
