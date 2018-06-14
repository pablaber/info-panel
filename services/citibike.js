var request = require('request');

const stationStatusUrl = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
const selectedStations = [
  { id: 3431, name: "E 35 St & 3 Ave" },
  { id: 472, name: "E 32 St & Park Ave" },
  // { id: 167, name "E 39 St & 3 Ave" },
  { id: 476, name: "E 31 St & 3 Ave" },
  { id: 546, name: "E 30 St & Park Ave S" }
];

function getCitibikeInfo() {
  return new Promise(function(resolve, reject) {
    request(stationStatusUrl, function(error, response, body) {
      var jsonBody = JSON.parse(body)
      if(!!jsonBody) {
        var stations = jsonBody.data.stations;
        var selectedStationsInfo = stations.filter(function(station) {
          var stationIds = selectedStations.map(function(value) {
            return value.id
          })
          return stationIds.indexOf(parseInt(station["station_id"])) >= 0
        }).map(function(station) {
          return {
            id: station["station_id"],
            name: stationNameForId(parseInt(station["station_id"])),
            bikesAvailable: station["num_bikes_available"],
            docksAvailable: station["num_docks_available"],
            isActive: station["is_renting"]
          }
        })
        resolve(selectedStationsInfo)
      }
    })
  })
}

function stationNameForId(id) {
  for(let station of selectedStations) {
    if(station.id === id) {
      return station.name;
    }
  }
}

module.exports = {
  getCitibikeInfo: getCitibikeInfo,
}
