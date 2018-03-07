var express = require('express');
var app = express();

// Modules
var nyw = require('./services/nyw-bus')

app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/nyw-bus-times', function (req, res) {
  nyw.getTimes().then(function(result) {
    res.send(result);
  });
});

app.listen(3000, function() {
  console.log("Listening on port 3000...");
});
