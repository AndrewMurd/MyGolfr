const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/dist/my-golfr'));

app.listen(process.env.PORT || 8000);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});