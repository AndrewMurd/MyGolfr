const { Router } = require("express");
var axios = require("axios");

const router = Router();

router.get("/courses", async (req, res) => {
  // Get places
  const search = req.query.search;

  var config = {
    method: "get",
    url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${
      "golf " + search
    }&key=${process.env.GOOGLE_API_KEY}`,
    headers: {},
  };

  axios(config)
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

module.exports = router;
