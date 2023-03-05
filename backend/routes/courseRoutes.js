const { Router } = require("express");
const Course = require("../models/course");
const { v4: uuidv4 } = require("uuid");

const router = Router();

// @desc Search Courses table
// @route GET /courses/search_courses
// @access Public
router.get("/search_courses", async (req, res) => {
  const searchQuery = req.query.searchQuery;

  const coursesRes = await Course.search(searchQuery);

  let data = [];
  for (let course of coursesRes) {
    data.push({
      course: JSON.parse(course.googleDetails),
      clicks: course.clicks,
    });
  }
  res.status(200).send({ data: data });
});

// @desc Get a course
// @route GET /courses/course
// @access Private
router.get("/course", async (req, res) => {
  const id = req.query.id;

  try {
    const courses = await Course.find(id);

    if (courses.length == 0) {
      res.status(404).send({ error: "Course does not exist!" });
    } else {
      courses[0].googleDetails = JSON.parse(courses[0].googleDetails);
      courses[0].courseDetails = JSON.parse(courses[0].courseDetails);
      courses[0].scorecard = JSON.parse(courses[0].scorecard);
      courses[0].mapLayout = JSON.parse(courses[0].mapLayout);
      res.status(200).send({ course: courses[0] });
    }
  } catch (error) {
    console.log(error);
    res.status(404).end();
  }
});

// @desc Get an array of courses
// @route GET /courses/courses
// @access Private
router.post("/courses", async (req, res) => {
  const ids = req.body.ids;

  const courses = [];
  for (let id of ids) {
    try {
      const course = await Course.find(id[0]);
  
      if (course.length == 0) {
        res.status(404).send({ error: "Course does not exist!" });
      } else {
        course[0].googleDetails = JSON.parse(course[0].googleDetails);
        course[0].courseDetails = JSON.parse(course[0].courseDetails);
        course[0].scorecard = JSON.parse(course[0].scorecard);
        course[0].mapLayout = JSON.parse(course[0].mapLayout);
        courses.push(course[0]);
      }
    } catch (error) {
      console.log(error);
      res.status(404).end();
    }
  }
  res.status(200).send({ courses: courses });
});

// @desc Add a course
// @route POST /courses/add
// @access Private
router.post("/add", async (req, res) => {
  for (let course of req.body.courses) {
    const res = await Course.find(course.reference);

    if (res.length == 0 && course.plus_code.compound_code) {
      let initialLayout = {};
      for (let i = 0; i < 18; i++) {
        initialLayout[i + 1] = {
          location: {
            lat: course.geometry.location.lat,
            lng: course.geometry.location.lng,
          },
          zoom: 16,
          teeLocations: [],
          flagLocation: {
            lat: course.geometry.location.lat,
            lng: course.geometry.location.lng,
          },
        };
      }

      const courseDetails = {
        id: course.reference,
        name: course.name,
        googleDetails: JSON.stringify(course),
        courseDetails: JSON.stringify({
          nineHoleGolfCourse: false,
        }),
        clicks: 0,
        scorecard: JSON.stringify([]),
        mapLayout: JSON.stringify(initialLayout),
      };

      try {
        await Course.save(courseDetails);
        console.log("Added to database:", course.name);
      } catch (error) {}
    }
  }

  res.end();
});

// @desc Update scorecard value
// @route POST /courses/set_scorecard_value
// @access Private
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

  await Course.updateColumn(JSON.stringify(scorecard), "scorecard", id);

  res.send({ scorecard: scorecard });
});

// @desc Update Course Data
// @route POST /courses/update
// @access Private
router.post("/update", async (req, res) => {
  const { id, courseDetails, clicks, scorecard, mapLayout } = req.body.data;

  const obj = {
    id: id,
    courseDetails: JSON.stringify(courseDetails),
    clicks: clicks,
    scorecard: JSON.stringify(scorecard),
    mapLayout: JSON.stringify(mapLayout),
  };

  await Course.update(obj);

  console.log(`Updating course: ${id}`);

  res.end();
});

// @desc Update Course Data Column
// @route POST /courses/update_column
// @access Private
router.post("/update_column", async (req, res) => {
  const id = req.body.id;
  const data = req.body.data;
  const type = req.body.type;

  console.log(`Updating ${type} for ${id}`);

  await Course.updateColumn(JSON.stringify(data), type, id);

  res.end();
});

// @desc Add click to clicks
// @route POST /courses/add_click
// @access Private
router.post("/add_click", async (req, res) => {
  const id = req.body.id;

  let courses = await Course.find(id);

  await Course.addClick((courses[0].clicks += 1), id);

  res.send({ numberOfClick: (courses[0].clicks += 1) });
});

module.exports = router;
