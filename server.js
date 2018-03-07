var express = require('express');
var app = express();

// Modules
var nyw = require('./services/nyw-bus')

app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/nyw-bus-times', function (req, res) {
  nyw.getTimes().then(function(result) {
    var busInfo = result.map(function(value) {
      return {
        id: value.o,
        x: value.x,
        y: value.y,
        lat: 40.763917 - ((40.763917-40.743392) * (value.y / 648)),
        long: -74.010776 + ((74.010776-73.963917) * (value.x / 1115)),
        direction: Math.round(value.i / 1944 * 360)
      }
    });
    res.send(busInfo);
  });
});

app.listen(3000, function() {
  console.log("Listening on port 3000...");
});
