const executeQuery = require("../util/database");

module.exports = class User {
  static find(email) {
    return executeQuery("SELECT * FROM users WHERE email = ?", [email]);
  }

  static findId(id) {
    return executeQuery("SELECT * FROM users WHERE id = ?", [id]);
  }

  static search(searchQuery) {
    return executeQuery(
      `SELECT id, name, email, hdcp, follows, followers FROM users WHERE name Like "%${searchQuery}%" OR id LIKE "%${searchQuery}%"`
    );
  }

  static findToken(token) {
    return executeQuery("SELECT * FROM users WHERE resetToken = ?", [token]);
  }

  static save(user) {
    return executeQuery(
      "INSERT INTO users (name, email, password, follows, followers) VALUES (?, ?, ?, ?, ?)",
      [user.name, user.email, user.password, JSON.stringify([]), JSON.stringify([])]
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
    return executeQuery(`UPDATE users SET hdcp = '${hdcp}' WHERE id = '${id}'`);
  }

  static updateToken(token, expiry, email) {
    return executeQuery(
      `UPDATE users SET resetToken = '${token}', resetTokenExpiry = '${expiry}' WHERE email = '${email}'`
    );
  }

  static updateName(id, name) {
    return executeQuery(`UPDATE users SET name = '${name}' WHERE id = '${id}'`);
  }

  static updateEmail(id, email) {
    return executeQuery(
      `UPDATE users SET email = '${email}' WHERE id = '${id}'`
    );
  }

  static updatePassword(id, password) {
    return executeQuery(
      `UPDATE users SET password = '${password}' WHERE id = '${id}'`
    );
  }

  static updateFollows(id, follows) {
    return executeQuery(
      `UPDATE users SET follows = '${follows}' WHERE id = '${id}'`
    );
  }

  static updateFollowers(id, followers) {
    return executeQuery(
      `UPDATE users SET followers = '${followers}' WHERE id = '${id}'`
    );
  }
};
