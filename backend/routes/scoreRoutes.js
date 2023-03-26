const { faC } = require("@fortawesome/free-solid-svg-icons");
const { Router } = require("express");
const Score = require("../models/score");
const User = require("../models/user");

const router = Router();

function parseData(score) {
  if (score.score) score.score = JSON.parse(score.score);
  if (score.teeData) score.teeData = JSON.parse(score.teeData);
  if (score.googleDetails)
    score.googleDetails = JSON.parse(score.googleDetails);
  if (score.courseDetails)
    score.courseDetails = JSON.parse(score.courseDetails);
  if (score.scorecard) score.scorecard = JSON.parse(score.scorecard);
  if (score.mapLayout) score.mapLayout = JSON.parse(score.mapLayout);
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
    let scores = [];
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

function calcOutIn(score) {
  let outNum = 0;
  let inNum = 0;
  for (let [key, value] of Object.entries(score)) {
    if (key == "Out" || key == "In") {
      continue;
    } else if (key <= 9) {
      outNum += Number(value);
    } else if (key > 9) {
      inNum += Number(value);
    }
  }
  return { Out: outNum, In: inNum };
}

async function calcHandicapIndex(userId) {
  const scores = await Score.findScoresForHdcp(userId);

  // see which scores contain a nineHole hole golf course
  const formattedScores = [];
  for (const score of scores) {
    parseData(score);
    if (!score.courseDetails.nineHoleGolfCourse) {
      formattedScores.push(score);
    }
  }
  let numberOf9Holes = 0;
  for (const score of scores) {
    if (score.courseDetails.nineHoleGolfCourse) {
      formattedScores.push(score);
      numberOf9Holes++;
    }
  }

  if (numberOf9Holes % 2 != 0) {
    formattedScores.pop();
  }

  if (
    scores.length -
      numberOf9Holes +
      (numberOf9Holes % 2 == 0 ? numberOf9Holes : numberOf9Holes - 1) <
    3
  )
    return;

  const currentHdcp = scores[0].hdcp;
  const HandicapDiffs = [];
  let lastNineHole = false;
  let lastHandicapDiff = 0;
  for (const score of formattedScores) {
    const courseHandicap = (currentHdcp * score.teeData.Slope) / 113;
    if (!currentHdcp) {
      for (let [key, value] of Object.entries(score.score)) {
        if (
          key != "In" &&
          key != "Out" &&
          value > Number(score.teeData["P" + key]) + 5
        ) {
          score.score[key] = `${Number(score.teeData["P" + key]) + 5}`;
        }
      }
    } else if (courseHandicap <= 9) {
      for (let [key, value] of Object.entries(score.score)) {
        if (
          key != "In" &&
          key != "Out" &&
          value > Number(score.teeData["P" + key]) + 2
        ) {
          score.score[key] = `${Number(score.teeData["P" + key]) + 2}`;
        }
      }
    } else {
      let maximumScoreFactor;
      if (courseHandicap >= 10 && courseHandicap <= 19) {
        maximumScoreFactor = 7;
      } else if (courseHandicap >= 20 && courseHandicap <= 29) {
        maximumScoreFactor = 8;
      } else if (courseHandicap >= 30 && courseHandicap <= 39) {
        maximumScoreFactor = 9;
      } else if (courseHandicap >= 40) {
        maximumScoreFactor = 10;
      }
      for (let [key, value] of Object.entries(score.score)) {
        if (key != "In" && key != "Out" && value > maximumScoreFactor) {
          score.score[key] = `${maximumScoreFactor}`;
        }
      }
    }
    const { Out, In } = calcOutIn(score.score);
    const AGS = In + Out;
    if (lastNineHole) {
      let HandicapDiff =
        (113 / score.teeData.Slope) * (AGS - score.teeData.Rating);
      if (HandicapDiff < 0) HandicapDiff = 0;
      if (lastHandicapDiff < 0) lastHandicapDiff = 0;
      HandicapDiffs.push(HandicapDiff + lastHandicapDiff);
      lastNineHole = false;
    } else if (score.courseDetails.nineHoleGolfCourse) {
      lastNineHole = true;
      lastHandicapDiff =
        (113 / score.teeData.Slope) * (AGS - score.teeData.Rating);
      continue;
    } else {
      let HandicapDiff =
        (113 / score.teeData.Slope) * (AGS - score.teeData.Rating);
      if (HandicapDiff < 0) HandicapDiff = 0;
      HandicapDiffs.push(HandicapDiff);
    }
  }
  let factor = 1;
  let adjustment = 0;
  const ln = HandicapDiffs.length;
  if (ln == 3) {
    adjustment = 2;
  } else if (ln == 4) {
    adjustment = 1;
  } else if (ln == 6) {
    adjustment = 1;
    factor = 2;
  } else if (ln >= 6 && ln <= 8) {
    factor = 2;
  } else if (ln >= 9 && ln <= 11) {
    factor = 3;
  } else if (ln >= 12 && ln <= 14) {
    factor = 4;
  } else if (ln >= 15 && ln <= 16) {
    factor = 5;
  } else if (ln >= 17 && ln <= 18) {
    factor = 6;
  } else if (ln == 19) {
    factor = 7;
  } else if (ln == 20) {
    factor = 8;
  }
  const lowestDiffs = HandicapDiffs.sort((a, b) => a - b).slice(0, factor);
  let sum = 0;
  for (let diff of lowestDiffs) {
    sum += diff;
  }
  let HandicapIndex = (
    (sum / lowestDiffs.length - adjustment) *
    0.96
  ).toFixed(1);
  if (HandicapIndex < 0) HandicapIndex = 0;

  console.log(HandicapDiffs);
  console.log(lowestDiffs);
  console.log(HandicapIndex);

  const maxHdcpIndex = 54;
  if (HandicapIndex > maxHdcpIndex) {
    HandicapIndex = maxHdcpIndex;
  }

  await User.updateHdcp(userId, HandicapIndex);

  console.log(`Updating Handicap for User ${userId}`);

  return HandicapIndex;
}

// @desc Update Score Data
// @route POST /scores/update
// @access Private
router.post("/update", async (req, res) => {
  const scoreData = req.body.scoreData;
  const type = req.body.type;

  if (type == "score") {
    const { Out, In } = calcOutIn(scoreData.score);
    scoreData.score.Out = Out;
    scoreData.score.In = In;

    await Score.update(JSON.stringify(scoreData[type]), type, scoreData.id);

    if (scoreData.statusComplete == 1 && scoreData.hdcpType == "basic") {
      scoreData.hdcp = await calcHandicapIndex(scoreData.userId);
    }
  } else if (type == "statusComplete") {
    const endTime = new Date().toISOString().slice(0, 19).replace("T", " ");
    await Score.update(endTime, "endTime", scoreData.id);

    await Score.update(JSON.stringify(scoreData[type]), type, scoreData.id);

    // calc and update hdcp for player on submission of new hdcp score (basic)
    if (scoreData.hdcpType == "basic") {
      scoreData.hdcp = await calcHandicapIndex(scoreData.userId);
    }
  } else if (type == 'hdcpType') {
    await Score.update(scoreData[type], type, scoreData.id);
    scoreData.hdcp = await calcHandicapIndex(scoreData.userId);
  } else {
    await Score.update(JSON.stringify(scoreData[type]), type, scoreData.id);
  }

  console.log(`Updating ${type} for ${scoreData.id}`);

  res.json({ scoreData: scoreData });
});

// @desc Delete a score
// @route POST /scores/delete
// @access Private
router.post("/delete", async (req, res) => {
  const id = req.body.id;

  try {
    await Score.delete(id);
    calcHandicapIndex(id);
    console.log(`Deleted score: ${id}`);
  } catch (error) {
    console.log(error);
  }
  res.end();
});

module.exports = router;
