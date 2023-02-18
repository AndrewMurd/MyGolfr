const executeQuery = require("../util/database");

module.exports = class Score {
  static find(scoreId) {
    return executeQuery("SELECT * FROM scores WHERE id = ?", [scoreId]);
  }

  static findStatus(status) {
    return executeQuery("SELECT * FROM scores WHERE statusComplete = ?", [status]);
  }

  static save(userId, courseId, courseData, score) {
    return executeQuery(
      "INSERT INTO scores (userId, courseId, courseData, score, statusComplete) VALUES (?, ?, ?, ?, ?)",
      [userId, courseId, courseData, score, false]
    );
  }

  static update(data, type, id) {
    return executeQuery(`UPDATE scores SET ${type} = '${data}' WHERE id = '${id}'`);
  }
};
