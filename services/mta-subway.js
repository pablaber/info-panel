var Mta = require('mta-gtfs');
var mta = new Mta({
  key: '6345f0e7460a9d832c9ea32d63331284',
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
