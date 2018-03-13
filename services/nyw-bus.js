var request = require('request');

// Returns a promise that resolves to the integer value of time it will take for
// the next bus to arrive (in seconds)
function getTimes() {
  return new Promise(function(resolve, reject) {
    fetchNYWData().then(function(result) {
      getAllTimes(result).then(function(timesResult) {
        resolve(timesResult);
      });
    }, function(reason) {
      reject(reason);
    });
  });
};

function fetchNYWData() {
  return new Promise(function(resolve, reject) {
    request(nywString(new Date().getTime()), function(error, response, body) {
      var extendedBusInfo = JSON.parse(body).map(function(value) {
        return {
          id: value.o,
          x: value.x,
          y: value.y,
          lat: 40.763917 - ((40.763917-40.743392) * (value.y / 648)),
          long: -74.010776 + ((74.010776-73.963917) * (value.x / 1115)),
          direction: Math.round(value.i / 1944 * 360)
        }
      });
      var validBusses = extendedBusInfo.filter(function(value) {
        return (insideApproachingBox(value.x, value.y) &&
               value.direction > 30 && value.direction < 210) ||
               (insideCloseBox(value.x, value.y) &&
               value.direction >=0 && value.direction < 270);
      });

      resolve(validBusses);
    }, function(reason) {
      reject(reason);
    });
  });
};

function getAllTimes(data) {
  return new Promise(function(resolve, reject) {
    var busEstimates = [];
    for(d of data) {
      busEstimates.push(getBusEstimate(d.lat, d.long));
    }

    Promise.all(busEstimates).then(function(values) {
      resolve(values);
    }, function(reason) {
      reject(reason);
    })
  })
}

function getBusEstimate(busLat, busLong) {
  return new Promise(function(resolve, reject) {
    request(googleApi(busLat, busLong), function(error, response, body) {
      var totalTime = JSON.parse(body).routes[0].legs.reduce(function(agg, val, i) {
        agg += val.duration.value;
        return agg;
      }, 0);
      resolve(totalTime);
    }, function(reason) {
      reject(reason);
    })
  });
}

function insideApproachingBox(dx, dy) {
  var validNS = (dx > (dy - 185) * (28/17)) &&
                (dy < (17/28) * dx + 185) &&
                (dx < (dy - 90) * (29/16)) &&
                (dy > (16/29) * dx + 90);

  var validEW = (dx > (dy - 550) * (-1/2)) &&
                (dy > (-2) * dx + 550) &&
                (dx < (dy - 1776) * (-3/5)) &&
                (dy < (-5/3) * dx + 1776);

  return validNS && validEW;
}

function insideCloseBox(dx, dy) {
  // TODO: this might have to have a small change since sometiems it thinks the
  // bus is going past 34th street and giving a 4 minute ETA when it should be 0
  var validNS = (dx > (dy - 237) * (15/8)) &&
                (dy < (8/15) * dx + 237) &&
                (dx < (dy - 130) * (2)) &&
                (dy > (1/2) * dx + 130);

  var validEW = (dx >= (dy - 1776) * (-3/5)) &&
                (dy >= (-5/3) * dx + 1776) &&
                (dx < (dy - 2545) * (-9/22)) &&
                (dy < (-22/9) * dx + 2545);

  return validNS && validEW;
}

function nywString(datetime) {
  var timeString = datetime.toString();
  return "https://services.saucontds.com/tds-map/nyw/nywvehiclePositions.do?id=1&time=" + timeString;
}

function googleApi(lat, long) {
  var apiString = "https://maps.googleapis.com/maps/api/directions/json?origin="
  apiString += lat + "," + long;
  apiString += "&destination=40.745811,-73.978303&waypoints=40.744494,-73.979058&key="
  apiString += process.env.GOOGLE_KEY
  return apiString;
}

module.exports = {
  getTimes: getTimes,
};
