var request = require('request');
var moment = require('moment');

const STOCK_CONFIG = [
  ".INX",
  "^VIX",
  "AAPL",
  "V"
]

function getStockInfo() {
  return new Promise(function(resolve, reject) {
    var daily = getDailyInfo();
    var intraday = getIntradayInfo();
    var promises = daily.concat(intraday);
    var obj = {};
    Promise.all(promises).then(function(values) {
      for(let value of values) {
        if(value.type === "daily") {
          if(!obj[value.symbol]) {
            obj[value.symbol] = {};
          }
          obj[value.symbol].prevClose = value["4. close"];
        }
        else if(value.type === "intraday") {
          if(!obj[value.symbol]) {
            obj[value.symbol] = {};
          }
          obj[value.symbol].currentPrice = value["4. close"];
        }
      }
      Object.keys(obj).map(function(key) {
        var value = obj[key]
        value.amountChange = (value.currentPrice - value.prevClose).toFixed(2);
        value.percentChange = ((value.currentPrice - value.prevClose) / value.prevClose).toFixed(4);
      })
      resolve(obj);
    }, function(reason) {
      reject(reason);
    })
  });
}

function getDailyInfo() {
  var promises = [];
  for(let symbol of STOCK_CONFIG) {
    promises.push(new Promise(function(resolve, reject) {
      request(dailyUrl(symbol), function(error, response, body) {
        var json = JSON.parse(body);
        if(!!json["Time Series (Daily)"]) {
          var sortedKeys = Object.keys(json["Time Series (Daily)"]).sort(function(a, b) {
            return moment(a, "YYYY-MM-DD").isBefore(moment(b, "YYYY-MM-DD")) ? 1 : -1;
          });
          var compareDate = sortedKeys[1];
          var obj = json["Time Series (Daily)"][compareDate];
          obj.symbol = symbol;
          obj.type = "daily";
          resolve(obj);
        }
        else {
          resolve({});
        }
      }, function(reason) {
        reject(reason);
      });
    }));
  }
  return promises;
}

function getIntradayInfo() {
  var promises = [];
  for(let symbol of STOCK_CONFIG) {
    promises.push(new Promise(function(resolve, reject) {
      request(intradayUrl(symbol), function(error, response, body) {
        var json = JSON.parse(body);
        if(!!json["Time Series (1min)"]) {
          var sortedKeys = Object.keys(json["Time Series (1min)"]).sort(function(a, b) {
            return moment(a, "YYYY-MM-DD HH:mm:ss").isBefore(moment(b, "YYYY-MM-DD HH:mm:ss")) ? 1 : -1;
          });
          var actualTime = sortedKeys[0];
          var obj = json["Time Series (1min)"][actualTime];
          obj.symbol = symbol;
          obj.type = "intraday";
          resolve(obj);
        }
        else {
          resolve({});
        }
      }, function(reason) {
        reject(reason);
      })
    }))
  }
  return promises;
}

function intradayUrl(symbol) {
  var url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol="
  url += symbol;
  url += "&interval=1min&apikey=";
  url += process.env.STOCKS_KEY;
  return url;
}

function dailyUrl(symbol) {
  var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=";
  url += symbol;
  url += "&apikey=";
  url += process.env.STOCKS_KEY;
  return url;
}

module.exports = {
  getStockInfo: getStockInfo
}
