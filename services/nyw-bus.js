var request = require('request');



function getTimes() {
  return new Promise(function(resolve, reject) {
    fetchNYWData().then(function(result) {
      resolve(result);
    });
  });
};

function fetchNYWData() {
  return new Promise(function(resolve, reject) {
    request(urlString(new Date().getTime()), function(error, response, body) {
      resolve(JSON.parse(body));
    });
  });
};

function urlString(datetime) {
  var timeString = datetime.toString();
  return "https://services.saucontds.com/tds-map/nyw/nywvehiclePositions.do?id=1&time=" + timeString;
}

module.exports = {
  getTimes: getTimes,
};
