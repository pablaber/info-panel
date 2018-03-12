var express = require('express');
var app = express();

require('dotenv').config();

// Modules
var nyw = require('./services/nyw-bus');
var mta = require('./services/mta-subway');
var darksky = require('./services/darksky');
var scores = require('./services/scores');
var news = require('./services/news');
var stocks = require('./services/stocks');

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

app.get('/mta-subway-times', function (req, res) {
  mta.getTimes().then(function(result) {
    res.send(result);
  });
});

app.get('/darksky-weather', function(req, res) {
  darksky.getWeather().then(function(result) {
    res.send(result);
  });
});

app.get('/scores', function(req, res) {
  scores.getScores().then(function(result) {
    res.send(result);
  })
});

app.get('/news', function(req, res) {
  news.getNews().then(function(result) {
    res.send(result);
  })
});

app.get('/stocks', function(req, res) {
  stocks.getStockInfo().then(function(result) {
    res.send(result);
  })
})

app.listen(8080, function() {
  console.log("Listening on port 8080...");
});
