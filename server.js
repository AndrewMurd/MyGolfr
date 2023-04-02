const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 4200;

app.use(express.static(__dirname + '/dist/my-golfr'));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/dist/my-golfr/index.html'));
});

app.listen(PORT, console.log(`Server Running on port ${PORT}`));