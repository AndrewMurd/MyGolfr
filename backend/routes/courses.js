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

  let data = [];
  for (let course of coursesRes) {
    data.push({ course: JSON.parse(course.googleDetails), clicks: course.clicks });
  }
  res.status(200).send({ data: data });
});

router.get("/course", async (req, res) => {
  const id = req.query.id;

  const courses = await Course.find(id);

  if (courses.length == 0) {
    res.status(404).send({ error: "Course does not exist!" });
  } else {
    courses[0].googleDetails = JSON.parse(courses[0].googleDetails);
    courses[0].courseDetails = JSON.parse(courses[0].courseDetails);
    courses[0].scorecard = JSON.parse(courses[0].scorecard);
    courses[0].mapLayout = JSON.parse(courses[0].mapLayout);
    let newDict = {};
    for (let [key, value] of Object.entries(courses[0])) {
      newDict[key] = value;
    }
    res.status(200).send({ course: newDict });
  }
});

router.post("/add", async (req, res) => {
  for (let course of req.body.courses) {
    const res = await Course.find(course.reference);

    if (res.length == 0 && course.plus_code.compound_code) {
      let initialLayout = {};
      for (let i = 0; i < 18; i++) {
        initialLayout[i + 1] = {
          location: {lat: course.geometry.location.lat, lng: course.geometry.location.lng},
          zoom: 16,
          teeLocations: [],
          flagLocations: [],
        };
      }

      const courseDetails = {
        id: course.reference,
        name: course.name,
        googleDetails: JSON.stringify(course),
        courseDetails: JSON.stringify({
          nineHoleGolfCourse: false
        }),
        clicks: 0,
        scorecard: JSON.stringify([]),
        mapLayout: JSON.stringify(initialLayout),
      };

      try {
        const res = await Course.save(courseDetails);
        console.log("Added to database:", course.name);
      } catch (error) {}
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

  const resultAfterUpdate = await Course.update(
    JSON.stringify(scorecard),
    "scorecard",
    id
  );

  res.send({ data: scorecard[length - 1] });
});

router.post("/update", async (req, res) => {
  const id = req.body.id;
  const data = req.body.data;
  const type = req.body.type;

  console.log(`Updating ${type} for ${id}`);

  const resultAfterUpdate = await Course.update(
    JSON.stringify(data),
    type,
    id
  );

  res.send({});
});

router.post("/add_click", async (req, res) => {
  const id = req.body.id;

  let courses = await Course.find(id);

  const resultAfterUpdate = await Course.addClick((courses[0].clicks += 1), id);

  res.send({ numberOfClick: (courses[0].clicks += 1) });
});

router.delete("/delete_tee", async (req, res) => {
  const courseId = req.query.courseId;
  const teeId = req.query.teeId;

  const courses = await Course.find(courseId);

  let scorecard = JSON.parse(courses[0].scorecard);

  scorecard = scorecard.filter((tee) => {
    return tee.id != teeId;
  });

  const resultAfterUpdate = await Course.updateScorecard(
    JSON.stringify(scorecard),
    courseId
  );

  res.send({});
});

module.exports = router;
