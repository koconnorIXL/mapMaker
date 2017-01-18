var fs = require('fs');
var canada_boundary = JSON.parse(fs.readFileSync('geojsonDatasets/Canada_northern_border.json')).features[0].geometry.coordinates;
var alaska_boundary = JSON.parse(fs.readFileSync('geojsonDatasets/Alaska_northern_border.json')).features[0].geometry.coordinates;
var greenland_boundary = JSON.parse(fs.readFileSync('geojsonDatasets/Greenland_arctic_ocean_boundary.json')).features[0].geometry.coordinates;
var iceland_boundary = JSON.parse(fs.readFileSync('geojsonDatasets/Iceland_arctic_ocean_boundary.json')).features[0].geometry.coordinates;
var norway_boundary = JSON.parse(fs.readFileSync('geojsonDatasets/Norway_arctic_ocean_boundary.json')).features[0].geometry.coordinates;
var russia_boundary = JSON.parse(fs.readFileSync('geojsonDatasets/Russia_arctic_ocean_boundary.json')).features[0].geometry.coordinates;

function createArcticOceanCoordinates() {
  return russia_boundary.reverse()
    .concat(norway_boundary.reverse())
    .concat(iceland_boundary.slice())
    .concat(greenland_boundary.reverse())
    .concat(canada_boundary.reverse())
    .concat(alaska_boundary.reverse())
    .map(function(p) { while (p[0] < 0) { p[0] += 360; } return p; });
}

module.exports = createArcticOceanCoordinates;

