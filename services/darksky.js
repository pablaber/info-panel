var request = require('request');

const KEY = '952592b0736d6861a3a0bc97d4f1bdc4';
const LAT = 40.7469137;
const LONG = -73.9794722;

function getWeather() {
  return new Promise(function(resolve, reject) {
    request(darkskyUrl(LAT, LONG, KEY), function(error, response, body) {
      resolve(body);
    });
  });

}

function darkskyUrl(lat, long, key) {
  return "https://api.darksky.net/forecast/" +
    KEY + "/" + LAT + "," + LONG;
}

module.exports = {
  getWeather: getWeather,
}
