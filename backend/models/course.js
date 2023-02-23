const executeQuery = require("../util/database");

module.exports = class Course {
  static search(searchQuery) {
    return executeQuery(
      `SELECT * FROM courses WHERE name Like "%${searchQuery}%"`
    );
  }

  static find(courseId) {
    return executeQuery("SELECT * FROM courses WHERE id = ?", [courseId]);
  }

  static save(course) {
    return executeQuery(
      "INSERT INTO courses (id, name, googleDetails, courseDetails, clicks, scorecard, mapLayout) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        course.id,
        course.name,
        course.googleDetails,
        course.courseDetails,
        course.clicks,
        course.scorecard,
        course.mapLayout,
      ]
    );
  }

  static updateColumn(data, type, id) {
    return executeQuery(
      `UPDATE courses SET ${type} = '${data}' WHERE id = '${id}'`
    );
  }

  static update(update) {
    return executeQuery(
      `UPDATE courses SET courseDetails = '${update.courseDetails}',
                          clicks = '${update.clicks}',
                          scorecard = '${update.scorecard}',
                          mapLayout = '${update.mapLayout}'
        WHERE id = '${update.id}'`
    );
  }

  static addClick(clicks, id) {
    return executeQuery("UPDATE courses SET clicks = ? WHERE id = ?", [
      clicks,
      id,
    ]);
  }
};
