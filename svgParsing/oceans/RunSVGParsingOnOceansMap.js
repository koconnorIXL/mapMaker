var fs = require('fs');
var createGeojsonObject = require('../CreateGeojsonObject.js');

var svgToGeojson = require('../SVGToGeographicCoordinates.js');

var createSouthernOceanCoordinates = require('./CreateSouthernOceanCoordinates.js');
var createPacificOceanCoordinates = require('./CreatePacificOceanCoordinates.js');
var createArcticOceanCoordinates = require('./CreateArcticOceanCoordinates.js');
var spliceSouthernOcean = require('./SpliceSouthernOcean.js');

var getProjection = require('./GetProjectionUsedForIllustrationSVG.js');
var d3Projection = getProjection();

var features = [];

svgToGeojson('ocean_map_outlined.svg', d3Projection, function(coordinateLists) {
  for (var id in coordinateLists) {
    console.log(id);
    var coordinateList;
    var properties = {
      name: id
    };
    if (id === 'Southern_Ocean') {
      coordinateList = [createSouthernOceanCoordinates(0, 360, 1e4)];
    }
    else if (id === 'Pacific_Ocean') {
      coordinateList = [createPacificOceanCoordinates()];
    }
    else if (id === 'Arctic_Ocean') {
      coordinateList = [createArcticOceanCoordinates()];
    }
    else if (coordinateLists.hasOwnProperty(id)) {
      coordinateList = coordinateLists[id];
      if (id === 'Indian_Ocean') {
        coordinateList = coordinateList.map(function(list) { return list.reverse(); });
      }

      if (id === 'Indian_Ocean' || id === 'Atlantic_Ocean') {
        coordinateList = coordinateList.map(function(list) { return spliceSouthernOcean(list); });
      }
    }

    geojsonObject = createGeojsonObject(
      coordinateList,
      properties);
    features.push(geojsonObject.features[0]);
    fs.writeFileSync('geojsonDatasets/' + id + '.json', JSON.stringify(geojsonObject, null, '  '));
  }
});

var featureCollection = {
  type: 'FeatureCollection',
  features: features
};

fs.writeFileSync('geojsonDatasets/oceans.json', JSON.stringify(featureCollection, null, '  '));

