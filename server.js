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
var logger = require('./services/logger');

const DEBUG = true;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  logger.error("Call made to home.")
  res.send('Use API');
});

app.get('/nyw-bus-times', function (req, res) {
  nyw.getTimes().then(function(result) {
    logger.info("Successful call to \"nyw-bus-times\"")
    res.send(result);
  }, function(reason) {
    if(reason === "OFF_PEAK") {
      logger.info("Off peak call made to \"nyw-bus-times\".")
    }
    else {
      logger.error("Call failed to \"nyw-bus-times\". Info below:\n" + reason)
    }
    var rejection = {
      failed: true,
      error: reason
    }
    res.send(JSON.stringify(rejection));
  });
});

app.get('/mta-subway-times', function (req, res) {
  mta.getTimes().then(function(result) {
    logger.info("Successful call to \"mta-subway-times\"")
    res.send(result);
  }, function(reason) {
    logger.error("Call failed to \"mta-subway-times\". Info below:\n" + reason);
    var rejection = {
      failed: true,
      error: reason
    }
    res.send(JSON.stringify(rejection));
  });
});

app.get('/darksky-weather', function(req, res) {
  darksky.getWeather().then(function(result) {
    logger.info("Successful call to \"darksky-weather\"")
    res.send(result);
  }, function(reason) {
    logger.error("Call failed to \"darksky-weather\". Info below:\n" + reason)
    var rejection = {
      failed: true,
      error: reason
    }
    res.send(JSON.stringify(rejection));
  });
});

app.get('/scores', function(req, res) {
  scores.getScores().then(function(result) {
    logger.info("Successful call to \"scores\"")
    res.send(result);
  }, function(reason) {
    logger.error("Call failed to \"scores\". Info below:\n" + reason)
    var rejection = {
      failed: true,
      error: reason
    }
    res.send(JSON.stringify(rejection));
  })
});

app.get('/news', function(req, res) {
  news.getNews().then(function(result) {
    logger.info("Successful call to \"news\"")
    res.send(result);
  }, function(reason) {
    logger.error("Call failed to \"news\". Info below:\n" + reason);
    var rejection = {
      failed: true,
      error: reason
    }
    res.send(JSON.stringify(rejection));
  })
});

app.get('/stocks', function(req, res) {
  stocks.getStockInfo().then(function(result) {
    logger.info("Successful call to \"stocks\"")
    res.send(result);
  }, function(reason) {
    logger.error("Call failed to \"stocks\". Info below:\n" + reason);
    var rejection = {
      failed: true,
      error: reason
    }
    res.send(JSON.stringify(rejection));
  })
})

app.listen(8080, function() {
  logger.info("Listening on port 8080...");
});
