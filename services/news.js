var request = require('request');

const MAX_ENTRIES = 3;

function getNews() {
  return new Promise(function(resolve, reject) {
    request(newsUrl(), function(error, response, body) {
      resolve(JSON.parse(body).articles);
    }, function(reason) {
      reject(reason);
    })
  });
}

function newsUrl() {
  var url = "https://newsapi.org/v2/top-headlines?country=us&apiKey=";
  url += process.env.NEWS_KEY;
  url += "&pageSize=";
  url += MAX_ENTRIES;
  return url;
}

module.exports = {
  getNews: getNews
}
