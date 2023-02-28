const executeQuery = require("../util/database");

module.exports = class Score {
  static find(scoreId) {
    return executeQuery("SELECT * FROM scores WHERE id = ?", [scoreId]);
  }

  static findStatus(status) {
    return executeQuery("SELECT * FROM courses INNER JOIN scores ON courses.id = scores.courseId WHERE statusComplete = ?", [
      status,
    ]);
  }

  static findUser(userId, status) {
    return executeQuery(
      "SELECT * FROM courses INNER JOIN scores ON courses.id = scores.courseId WHERE userId = ? AND statusComplete = ?",
      [userId, status]
    );
  }

  static save(userId, courseId, teeData, dateTime) {
    return executeQuery(
      "INSERT INTO scores (userId, courseId, teeData, score, statusComplete, dateTime) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, courseId, teeData, JSON.stringify({}), 0, dateTime]
    );
  }

  static update(data, type, id) {
    return executeQuery(
      `UPDATE scores SET ${type} = '${data}' WHERE id = '${id}'`
    );
  }

  static delete(id) {
    return executeQuery(`DELETE FROM scores WHERE id = '${id}'`);
  }
};
