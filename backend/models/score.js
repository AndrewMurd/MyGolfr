const executeQuery = require("../util/database");

module.exports = class Score {
  static find(scoreId) {
    return executeQuery(
      "SELECT score, hdcp, teeData, scorecard, courseDetails, mapLayout, courses.name as courseName, googleDetails, scorecard, scores.id as id, userId, courseId, statusComplete, hdcpType, startTime, endTime, users.name as username FROM courses INNER JOIN scores INNER JOIN users ON courses.id = scores.courseId AND userId = users.id WHERE scores.id = ?",
      [scoreId]
    );
  }

  static findCourse(courseId) {
    return executeQuery(
      `SELECT score, hdcp, teeData, scorecard, courses.name as courseName, courseDetails, googleDetails, scorecard, scores.id as id, userId, courseId, statusComplete, hdcpType, startTime, endTime, users.name as username FROM courses INNER JOIN scores INNER JOIN users ON scores.courseId = '${courseId}' AND courses.id = '${courseId}' AND userId = users.id ORDER BY endTime desc limit 30`
    );
  }

  static findCourseWithStatus(courseId, status) {
    return executeQuery(
      `SELECT score, hdcp, teeData, scorecard, courses.name as courseName, courseDetails, googleDetails, scorecard, scores.id as id, userId, courseId, statusComplete, hdcpType, startTime, endTime, users.name as username FROM courses INNER JOIN scores INNER JOIN users ON scores.courseId = '${courseId}' AND courses.id = '${courseId}' AND userId = users.id WHERE statusComplete = ${status} ORDER BY endTime desc limit 30`
    );
  }

  static findUser(userId, limit) {
    return executeQuery(
      `SELECT score, hdcp, usedForHdcp, teeData, scorecard, courses.name as courseName, courseDetails,  googleDetails, scorecard, scores.id as id, userId, courseId, statusComplete, hdcpType, startTime, endTime, users.name as username FROM courses INNER JOIN scores INNER JOIN users ON courses.id = scores.courseId AND userId = users.id WHERE userId = ${userId} ORDER BY endTime desc limit ${limit}`
    );
  }

  static findUserWithStatus(userId, status, limit) {
    return executeQuery(
      `SELECT score, hdcp, usedForHdcp, teeData, scorecard, courseDetails, mapLayout, courses.name as courseName, googleDetails, scorecard, scores.id as id, userId, courseId, statusComplete, hdcpType, startTime, endTime, users.name as username FROM courses INNER JOIN scores INNER JOIN users ON courses.id = scores.courseId AND userId = users.id WHERE userId = ${userId} AND statusComplete = ${status} ORDER BY endTime desc limit ${limit}`
    );
  }

  static findUserWithStatusNoLimit(userId, status) {
    return executeQuery(
      `SELECT score, hdcp, usedForHdcp, teeData, scorecard, courseDetails, mapLayout, courses.name as courseName, googleDetails, scorecard, scores.id as id, userId, courseId, statusComplete, hdcpType, startTime, endTime, users.name as username FROM courses INNER JOIN scores INNER JOIN users ON courses.id = scores.courseId AND userId = users.id WHERE userId = ${userId} AND statusComplete = ${status} ORDER BY endTime desc`
    );
  }

  static findScoresForHdcp(userId) {
    return executeQuery(
      "SELECT score, hdcp, usedForHdcp, teeData, scorecard, courseDetails, mapLayout, courses.name as courseName, googleDetails, scorecard, scores.id as id, userId, courseId, statusComplete, hdcpType, startTime, endTime, users.name as username FROM courses INNER JOIN scores INNER JOIN users ON courses.id = scores.courseId AND userId = users.id WHERE userId = ? AND statusComplete = 1 AND hdcpType = 'basic' ORDER BY endTime desc limit 40",
      [userId]
    );
  }

  static save(userId, courseId, teeData, hdcpType, startTime) {
    return executeQuery(
      "INSERT INTO scores (userId, courseId, teeData, score, statusComplete, hdcpType, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        courseId,
        teeData,
        JSON.stringify({ In: 0, Out: 0 }),
        0,
        hdcpType,
        startTime,
        null,
      ]
    );
  }

  static resetUsedForHdcp(userId) {
    return executeQuery(
      `UPDATE scores SET usedForHdcp = '0' Where userId = '${userId}'`
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
