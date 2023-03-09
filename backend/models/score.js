const executeQuery = require("../util/database");

module.exports = class Score {
  static find(scoreId) {
    return executeQuery(
      "SELECT * FROM courses INNER JOIN scores ON courses.id = scores.courseId WHERE scores.id = ?",
      [scoreId]
    );
  }

  static findCourse(courseId) {
    return executeQuery(
      "SELECT * FROM courses INNER JOIN scores ON ? = scores.courseId",
      [courseId]
    );
  }

  static findCourseWithStatus(courseId, status) {
    return executeQuery(
      "SELECT * FROM courses INNER JOIN scores ON ? = scores.courseId WHERE statusComplete = ?",
      [courseId, status]
    );
  }

  static findUser(userId) {
    return executeQuery(
      "SELECT * FROM courses INNER JOIN scores ON courses.id = scores.courseId WHERE userId = ?",
      [userId]
    );
  }

  static findUserWithStatus(userId, status) {
    return executeQuery(
      "SELECT * FROM courses INNER JOIN scores ON courses.id = scores.courseId WHERE userId = ? AND statusComplete = ?",
      [userId, status]
    );
  }

  static save(userId, courseId, teeData, hdcpType, dateTime) {
    return executeQuery(
      "INSERT INTO scores (userId, courseId, teeData, score, statusComplete, hdcpType, dateTime) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, courseId, teeData, JSON.stringify({}), 0, hdcpType, dateTime]
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
