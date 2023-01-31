const { Router } = require("express");
const axios = require("axios");
var fs = require('fs');

const router = Router();

router.get("/courses", async (req, res) => {
  // Get places
  const search = req.query.search;
  const sessiontoken = req.query.sessiontoken;

  var config = {
    method: "get",
    url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${
      "golf " + search
    }&sessiontoken=${sessiontoken}
    &key=${process.env.GOOGLE_API_KEY}`,
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

// not working will do on client side instead
router.get("/photo", async (req, res) => {
  const width = req.query.width;
  const reference = req.query.reference;

  var config = {
    method: "get",
    url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${width}&photo_reference=${reference}&key=${process.env.GOOGLE_API_KEY}`,
    headers: {},
  };

  axios(config, {responseType: 'arraybuffer'})
    .then((response) => {
      // console.log(response.data);
      // trying to convert img to base64 (not working)
      var b64Response = Buffer.from(response.data, 'base64'); 
      // console.log(b64Response);
      res.send({'data': b64Response});
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

module.exports = router;
