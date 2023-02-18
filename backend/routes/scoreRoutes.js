const { Router } = require("express");
const Score = require("../models/score");

const router = Router();

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
      scores[0].courseData = JSON.parse(scores[0].courseData);
      let newDict = {};
      for (let [key, value] of Object.entries(scores[0])) {
        newDict[key] = value;
      }
      res.status(200).send({ course: newDict });
    }
  } catch (error) {
    console.log(error);
    res.status(404).end();
  }
});

// @desc Get scores with certain status
// @route GET /scores/score
// @access Private
router.get("/score_status", async (req, res) => {
  const status = req.query.status;

  try {
    const scores = await Score.findStatus(status);

    if (scores.length == 0) {
      res.status(404).send({ error: "Score does not exist!" });
    } else {
      scores[0].courseData = JSON.parse(scores[0].courseData);
      let newDict = {};
      for (let [key, value] of Object.entries(scores[0])) {
        newDict[key] = value;
      }
      res.status(200).send({ scores: newDict });
    }
  } catch (error) {
    console.log(error);
    res.status(404).end();
  }
});

router.post("/add", async (req, res) => {
  const { userId, courseId, courseData } = req.body;

  try {
    await Score.save(userId, courseId, JSON.stringify(courseData), JSON.stringify({}));
    console.log(`Added new score for user ${userId}`);
  } catch (error) {
    console.log(error);
  }
  res.end();
});

// @desc Update Score Data
// @route POST /scores/update
// @access Private
router.post("/update", async (req, res) => {
  const id = req.body.id;
  const data = req.body.data;
  const type = req.body.type;

  console.log(`Updating ${type} for ${id}`);

  await Score.update(JSON.stringify(data), type, id);

  res.end();
});

module.exports = router;
