var moment = require('moment');

module.exports = {
  info: function(message) {
    var timestamp = new moment().format("YYYY-MM-DD HH:mm:ss");
    var log = "INFO   [" + timestamp + "] " + message;
    console.log(log);
  },

  error: function(message) {
    var timestamp = new moment().format("YYYY-MM-DD HH:mm:ss");
    var log = "ERROR  [" + timestamp + " ]" + message;
    console.log(log);
  }
}
