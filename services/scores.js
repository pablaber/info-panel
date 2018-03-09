var request = require('request');
var moment = require('moment');

const MSF_BASE = "https://pablaber:aisling123@api.mysportsfeeds.com/v1.2/pull/";
const MAX_ENTRIES = 4;

const TEAM_CONFIG = {
  "nhl": ["nyr"],
  "nba": ["nyk"],
  "mlb": ["nyy"],
  "nfl": ["nyg"]
}

function getScores() {
  var now = moment();
  return new Promise(function(resolve, reject) {
    var promises = [
      getYesterdaysScores(now),
      getFutureGames(now)
    ]
    Promise.all(promises).then(function(values) {
      var results = {
        "yesterday": values[0],
        "future": values[1]
      }
      resolve(results);
    })

  })
}

function getYesterdaysScores(date) {
  return new Promise(function(resolve, reject) {
    var leagues = Object.keys(TEAM_CONFIG).map(function(value) {
      return yesterdaysScores(value, TEAM_CONFIG[value], date);
    });

    Promise.all(leagues).then(function(values) {
      var allResults = [].concat.apply([], values).filter(function(value) {
        return !!value;
      });
      allResults.sort(function(a, b) {
        var aTime = moment(a.game.date + " " + a.game.time, "YYYY-MM-DD h:mmA");
        var bTime = moment(b.game.date + " " + b.game.time, "YYYY-MM-DD h:mmA");
        return aTime.diff(bTime);
      })
      resolve(allResults);
    });
  });


}

function getFutureGames(date) {
  return new Promise(function(resolve, reject) {
    var leagues = Object.keys(TEAM_CONFIG).map(function(value) {
      return scheduleForTeams(value, TEAM_CONFIG[value], date);
    });

    Promise.all(leagues).then(function(values) {
      var allGames = [].concat.apply([], values);
      var result = allGames.sort(function(a, b) {
        var aTime = moment(a.date + " " + a.time, "YYYY-MM-DD h:mmA");
        var bTime = moment(b.date + " " + b.time, "YYYY-MM-DD h:mmA");
        return aTime.diff(bTime);
      }).slice(0, MAX_ENTRIES)
      resolve(result);
    })
  })

}

function yesterdaysScores(league, teams, date) {
  var url = "https://pablaber:aisling123@api.mysportsfeeds.com/v1.2/pull/"
  url += league;
  url += "/current/scoreboard.json?fordate="
  url += date.subtract(1, "days").format("YYYYMMDD");
  url += "&team=";
  url +=teams.join(',');
  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if(Math.floor(response.statusCode / 100) === 4) {
        resolve([]);
      }
      else {
        resolve(JSON.parse(body).scoreboard.gameScore)
      }
    })
  })
}

function scheduleForTeams(league, teams, date) {
  var url = "https://pablaber:aisling123@api.mysportsfeeds.com/v1.2/pull/"
  url += league;
  url += "/current/full_game_schedule.json?team="
  url += teams.join(',');
  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if(Math.floor(response.statusCode / 100) === 4) {
        resolve([]);
      }
      else {
        var gameSchedule = JSON.parse(body).fullgameschedule.gameentry;
        var futureGames = gameSchedule.filter(function(value) {
          var datetime = value.date + " " + value.time;
          return moment(datetime, "YYYY-MM-DD h:mmA").isAfter(date);
        }).slice(0,MAX_ENTRIES)
        resolve(futureGames)
      }
    })
  })
}

module.exports = {
  getScores: getScores,
}
