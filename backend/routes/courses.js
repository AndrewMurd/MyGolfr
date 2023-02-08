const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Course = require("../models/course");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const router = Router();

router.get("/search_courses", async (req, res) => {
  const searchQuery = req.query.searchQuery;

  const coursesRes = await Course.search(searchQuery);

  let courses = [];
  for (let course of coursesRes) {
    courses.push(JSON.parse(course.course));
  }
  res.status(200).send({ courses: courses });
});

router.get("/scorecard", async (req, res) => {
  const id = req.query.id;

  const courses = await Course.find(id);

  if (courses.length == 0) {
    res.status(404).send({ error: "Course does not exist!" });
  } else {
    let scorecard = JSON.parse(courses[0].scorecard);
    res.status(200).send({ scorecard: scorecard });
  }
});

router.post("/add", async (req, res) => {
  for (let course of req.body.courses) {
    const res = await Course.find(course.reference);

    if (res.length == 0) {
      const courseDetails = {
        id: course.reference,
        name: course.name,
        course: JSON.stringify(course),
        scorecard: JSON.stringify([]),
      };

      const res = await Course.save(courseDetails);

      console.log("Added to database:", course.name);
    }
  }

  res.send({});
});

router.post("/set_scorecard_value", async (req, res) => {
  const id = req.body.id;
  const data = req.body.data;

  const course = await Course.find(id);
  let scorecard = JSON.parse(course[0].scorecard);

  let length;
  if (data.id == "new") {
    length = scorecard.push({ id: uuidv4(), Position: scorecard.length + 1 });
  } else {
    for (let tee of scorecard) {
      if (tee.id == data.id[0]) {
        tee[data.id[1]] = data.value;
      }
    }
  }

  console.log(`Updating Scorecard for ${id} with data:`, data);

  const resultAfterUpdate = await Course.update(JSON.stringify(scorecard), id);

  res.send({ data: scorecard[length - 1] });
});

router.post("/set_scorecard", async (req, res) => {
  const id = req.body.id;
  const scorecard = req.body.scorecard;

  console.log(`Updating Scorecard for ${id}`);

  const resultAfterUpdate = await Course.update(JSON.stringify(scorecard), id);

  res.send({ data: scorecard });
});

router.delete("/delete_tee", async (req, res) => {
  const courseId = req.query.courseId;
  const teeId = req.query.teeId;

  const courses = await Course.find(courseId);

  let scorecard = JSON.parse(courses[0].scorecard);

  scorecard = scorecard.filter((tee) => {
    return tee.id != teeId;
  });

  const resultAfterUpdate = await Course.update(
    JSON.stringify(scorecard),
    courseId
  );

  res.send({});
});

module.exports = router;
