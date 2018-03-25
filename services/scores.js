var request = require('request');
var moment = require('moment');

const MSF_BASE = "https://" + process.env.MSF_USER + ":" + process.env.MSF_PASS + "@api.mysportsfeeds.com/v1.2/pull/";
const MAX_ENTRIES = 3;

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
    }, function(reason) {
      reject(reason);
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
        var aTime = moment(a.date, "YYYY-MM-DD h:mmA");
        var bTime = moment(b.date, "YYYY-MM-DD h:mmA");
        return aTime.diff(bTime);
      })
      resolve(allResults);
    }, function(reason) {
      reject(reason);
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
        var aTime = moment(a.date, "YYYY-MM-DD h:mmA");
        var bTime = moment(b.date, "YYYY-MM-DD h:mmA");
        return aTime.diff(bTime);
      }).slice(0, MAX_ENTRIES)
      resolve(result);
    }, function(reason) {
      reject(reason);
    })
  })

}

function yesterdaysScores(league, teams, date) {
  var url = MSF_BASE;
  url += league;
  url += "/current/scoreboard.json?fordate="
  url += moment().subtract(1, "days").format("YYYYMMDD");
  url += "&team=";
  url += teams.join(','); 
  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if(!!error) {
        reject(error);
      }
      if(!body || Math.floor(response.statusCode / 100) === 4 || !JSON.parse(body).scoreboard.gameScore) {
        resolve([]);
      }
      else {
        var scores = JSON.parse(body).scoreboard.gameScore;
        var leagueScores = scores.map(function(value) {
          var simplified = {league: league}
          simplified.awayTeam = value.game.awayTeam;
          simplified.homeTeam = value.game.homeTeam;
          simplified.awayScore = value.awayScore;
          simplified.homeScore = value.homeScore;
          simplified.date = value.game.date + " " + value.game.time;
          return simplified;
        })
        resolve(leagueScores)
      }
    }, function(reason) {
      reject(reason);
    })
  })
}

function scheduleForTeams(league, teams, date) {
  var url = MSF_BASE;
  url += league;
  url += "/current/full_game_schedule.json?team="
  url += teams.join(',');
  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if(!response || Math.floor(response.statusCode / 100) === 4) {
        resolve([]);
      }
      else {
        var gameSchedule = JSON.parse(body).fullgameschedule.gameentry;
        var futureGames = gameSchedule.filter(function(value) {
          var datetime = value.date + " " + value.time;
          return moment(datetime, "YYYY-MM-DD h:mmA").isAfter(date);
        }).map(function(value) {
          var simplified = {league: league}
          simplified.awayTeam = value.awayTeam;
          simplified.homeTeam = value.homeTeam;
          simplified.date = value.date + " " + value.time;
          simplified.location = value.location;
          return simplified;
        }).slice(0,MAX_ENTRIES)
        resolve(futureGames)
      }
    }, function(reason) {
      reject(reason);
    })
  })
}

module.exports = {
  getScores: getScores,
}
