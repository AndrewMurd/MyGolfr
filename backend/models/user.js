const executeQuery = require("../util/database");

module.exports = class User {
  static find(email) {
    return executeQuery("SELECT * FROM users WHERE email = ?", [email]);
  }

  static save(user) {
    return executeQuery(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [user.name, user.email, user.password]
    );
  }
};
