const executeQuery = require("../util/database");

module.exports = class Score {
  static find(scoreId) {
    return executeQuery("SELECT * FROM scores WHERE id = ?", [scoreId]);
  }

  static findStatus(status) {
    return executeQuery("SELECT * FROM scores WHERE statusComplete = ?", [status]);
  }

  static save(userId, courseId, courseData, score, teeData) {
    return executeQuery(
      "INSERT INTO scores (userId, courseId, courseData, teeData, score, statusComplete) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, courseId, courseData, teeData, score, false]
    );
  }

  static update(data, type, id) {
    return executeQuery(`UPDATE scores SET ${type} = '${data}' WHERE id = '${id}'`);
  }
};
