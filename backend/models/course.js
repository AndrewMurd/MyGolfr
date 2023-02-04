const executeQuery = require('../util/database');

module.exports = class Course {
    constructor(id, course, scorecard) {
        this.id = id;
        this.course = course;
        this.scorecard = scorecard;
    }

    static find(courseId) {
        return executeQuery(
            'SELECT * FROM courses WHERE id = ?', [courseId]
        );
    }

    static save(course) {
        return executeQuery(
            'INSERT INTO courses (id, course, scorecard) VALUES (?, ?, ?)',
            [course.id, course.course, course.scorecard]
        );
    }

    static update(scorecard, id) {
        return executeQuery(
            'UPDATE courses SET scorecard = ? WHERE id = ?',
            [scorecard, id]
        );
    }
}