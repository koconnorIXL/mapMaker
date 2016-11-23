
var fs = require('fs');
var createSouthernCoordinates = require('./CreateSouthernOceanCoordinates.js');
var westernBoundary = JSON.parse(fs.readFileSync('geojsonDatasets/Pacific_west_land_boundary.json')).features[0].geometry.coordinates;
var easternBoundary = JSON.parse(fs.readFileSync('geojsonDatasets/Pacific_east_land_boundary.json')).features[0].geometry.coordinates;
var northernBoundary = JSON.parse(fs.readFileSync('geojsonDatasets/Alaska_Russia_Pacific_Arctic_boundary.json')).features[0].geometry.coordinates;
var russiaLastPart = JSON.parse(fs.readFileSync('geojsonDatasets/Russia_last_part.json')).features[0].geometry.coordinates;

easternBoundary = easternBoundary.map(function(p) { return [p[0] + 360, p[1]]; });
northernBoundary = northernBoundary.map(function(p) { return [p[0] + 360, p[1]]; });
russiaLastPart = russiaLastPart.map(function(p) { return [p[0] + 360, p[1]]; });
var southwestPoint = westernBoundary[0];
var southeastPoint = easternBoundary[0];

var southernBoundary = createSouthernCoordinates(southwestPoint[0], southeastPoint[0], 1e3);

function createPacificCoordinates() {
  return westernBoundary.slice()
    .concat(russiaLastPart.reverse())
    .concat(northernBoundary.reverse())
    .concat(easternBoundary.reverse())
    .concat(southernBoundary.reverse());
}

module.exports = createPacificCoordinates;
