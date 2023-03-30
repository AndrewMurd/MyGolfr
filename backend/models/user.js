const executeQuery = require("../util/database");

module.exports = class User {
  static find(email) {
    return executeQuery("SELECT * FROM users WHERE email = ?", [email]);
  }

  static findToken(token) {
    return executeQuery("SELECT * FROM users WHERE resetToken = ?", [token]);
  }

  static save(user) {
    return executeQuery(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [user.name, user.email, user.password]
    );
  }

  static update(update) {
    return executeQuery(
      `UPDATE users SET name = '${update.name}',
                        email = '${update.email}',
                        favCourses = '${JSON.stringify(update.favCourses)}'
        WHERE id = '${update.id}'`
    );
  }

  static updateHdcp(id, hdcp) {
    return executeQuery(
      `UPDATE users SET hdcp = '${hdcp}' WHERE id = '${id}'`
    );
  }

  static updateToken(token, expiry, email) {
    return executeQuery(
      `UPDATE users SET resetToken = '${token}', resetTokenExpiry = '${expiry}' WHERE email = '${email}'`
    );
  }

  static updatePassword(password, id) {
    return executeQuery(
      `UPDATE users SET password = '${password}' WHERE id = '${id}'`
    );
  }
};
