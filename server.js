var express = require('express');
var app = express();

// Modules
var nyw = require('./services/nyw-bus')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/nyw-bus-times', function (req, res) {
  nyw.getTimes().then(function(result) {
    res.send(result);
  });
});

app.listen(8080, function() {
  console.log("Listening on port 8080...");
});
