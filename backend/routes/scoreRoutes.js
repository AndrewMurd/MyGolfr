const { Router } = require("express");
const Score = require("../models/score");

const router = Router();

function parseData(score) {
  score.score = JSON.parse(score.score);
  score.teeData = JSON.parse(score.teeData);
  score.googleDetails = JSON.parse(score.googleDetails);
  score.courseDetails = JSON.parse(score.courseDetails);
  score.scorecard = JSON.parse(score.scorecard);
  score.mapLayout = JSON.parse(score.mapLayout);
  return score;
}

// @desc Get a score
// @route GET /scores/score
// @access Private
router.get("/score", async (req, res) => {
  const id = req.query.id;

  try {
    const scores = await Score.find(id);

    if (scores.length == 0) {
      res.status(404).send({ error: "Score does not exist!" });
    } else {
      parseData(scores[0]);
      res.status(200).send({ score: scores[0] });
    }
  } catch (error) {
    console.log(error);
    res.status(404).end();
  }
});

// @desc Get scores for a golf course with a status
// @route GET /scores/score_status
// @access Private
router.get("/score_status", async (req, res) => {
  const status = req.query.status;
  const courseId = req.query.courseId;

  try {
    let scores;
    if (status == 2) {
      scores = await Score.findCourse(courseId);
    } else {
      scores = await Score.findCourseWithStatus(courseId, status);
    }

    if (scores.length == 0) {
      res.status(404).send({ error: "Score does not exist!" });
    } else {
      for (const score of scores) {
        parseData(score);
      }
      res.status(200).send({ scores: scores });
    }
  } catch (error) {
    console.log(error);
    res.status(404).end();
  }
});

// @desc Get scores for user
// @route GET /scores/score_user
// @access Private
router.get("/score_user", async (req, res) => {
  const status = req.query.status;
  const userId = req.query.userId;

  try {
    let scores;
    if (status == 2) {
      scores = await Score.findUser(userId);
    } else {
      scores = await Score.findUserWithStatus(userId, status);
    }

    if (scores.length == 0) {
      res.status(404).send({ error: "Score does not exist!" });
    } else {
      for (const score of scores) {
        parseData(score);
      }
      res.status(200).send({ scores: scores });
    }
  } catch (error) {
    console.log(error);
    res.status(404).end();
  }
});

// @desc Add new score
// @route POST /scores/add
// @access Private
router.post("/add", async (req, res) => {
  const { userId, courseId, teeData, hdcpType, startTime } = req.body;

  try {
    const response = await Score.save(
      userId,
      courseId,
      JSON.stringify(teeData),
      hdcpType,
      startTime
    );
    console.log(`Added new score for user ${userId}`);
    res.json({ id: response.insertId });
  } catch (error) {
    console.log(error);
  }
});

// @desc Update Score Data
// @route POST /scores/update
// @access Private
router.post("/update", async (req, res) => {
  const id = req.body.id;
  const data = req.body.data;
  const type = req.body.type;

  if (type == "score") {
    let inNum = 0;
    let outNum = 0;
    for (let [key, value] of Object.entries(data)) {
      if (key == "Out" || key == "In") {
        continue;
      } else if (key <= 9) {
        outNum += Number(value);
      } else if (key > 9) {
        inNum += Number(value);
      }
    }
    data["Out"] = outNum;
    data["In"] = inNum;
  } else if (type == "statusComplete") {
    const endTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await Score.update(endTime, 'endTime', id);
  }
  
  console.log(`Updating ${type} for ${id}`);

  await Score.update(JSON.stringify(data), type, id);

  res.json({ data: data });
});

// @desc Delete a score
// @route POST /scores/delete
// @access Private
router.post("/delete", async (req, res) => {
  const id = req.body.id;

  try {
    await Score.delete(id);
    console.log(`Deleted score: ${id}`);
  } catch (error) {
    console.log(error);
  }
  res.end();
});

module.exports = router;
