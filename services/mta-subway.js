var Mta = require('mta-gtfs');
var mta = new Mta({
  key: process.env.MTA_KEY,
  feed_id: 1,
});

const STOP_ID = 632;

function getTimes() {
  return new Promise(function(resolve, reject) {
    mta.schedule(STOP_ID).then(function (result) {
      var formattedSchedule = result.schedule[STOP_ID];
      resolve(formattedSchedule);
    }).catch(function (err) {
      reject(err);
    });
  });

};

module.exports = {
  getTimes: getTimes,
};
