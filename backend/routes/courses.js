const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Course = require("../models/course");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const router = Router();

router.get("/scorecard", async (req, res) => {
  const id = req.query.id;

  const courses = await Course.find(id);

  if (courses.length == 0) {
    res.status(404).send({error: 'Course does not exist!'});
  } else {
    let scorecard = JSON.parse(courses[0].scorecard);
    res.status(200).send({scorecard: scorecard});
  }
});

router.post("/add", async (req, res) => {
  for (let course of req.body.courses) {
    const res = await Course.find(course.reference);

    if (res.length == 0) {
      const courseDetails = {
        id: course.reference,
        course: JSON.stringify(course),
        scorecard: JSON.stringify([]),
      };

      const res = await Course.save(courseDetails);

      console.log("Added to database:", course.name);
    }
  }

  res.send({});
});

router.post("/set_scorecard", async (req, res) => {
  const id = req.body.id;
  const data = req.body.data;

  const course = await Course.find(id);
  let scorecard = JSON.parse(course[0].scorecard);

  if (scorecard.length == 0) scorecard.push({color: data.id[0]});

  let doesInclude = false;
  for (let tee of scorecard) {
    if (tee.color == data.id[0]) {
      tee[data.id[1]] = data.value;
      doesInclude = true;
    }
  }

  if (!doesInclude) {
    scorecard.push({color: data.id[0]});
    scorecard[0][data.id[1]] = data.value;
  }

  console.log(`Updating Scorecard for ${id} with data:`, data);
  
  const resultAfterUpdate = await Course.update(JSON.stringify(scorecard), id);

  res.send({});
});

module.exports = router;
