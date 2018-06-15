var request = require('request');
var constants = require('./constants');

const KEY = process.env.DARKSKY_KEY;
const LAT = 40.7469137;
const LONG = -73.9794722;

function getWeather() {
  return new Promise(function(resolve, reject) {
    request(darkskyUrl(LAT, LONG, KEY), function(error, response, body) {
      resolve(body);
    }, function(reason) {
      reject(reason);
    });
  });

}

function darkskyUrl(lat, long, key) {
  var url =  "https://api.darksky.net/forecast/" +
    KEY + "/" + LAT + "," + LONG;
  return constants.addOptionsTo(url);
}

module.exports = {
  getWeather: getWeather,
}
