var fs = require('fs');
var createGeojsonObject = require('../../svgParsing/CreateGeojsonObject.js');
var svgToGeojson = require('../../svgParsing/SVGToGeographicCoordinates.js');

var getProjection = require('../../svgParsing/GetProjectionUsedForIllustrationSVG.js');
var d3Projection = getProjection();

svgToGeojson('russia_boundary.svg', d3Projection, function(coordinateLists) {
  for (var id in coordinateLists) {
    if (coordinateLists.hasOwnProperty(id)) {
      console.log(id);
      var properties = {
        name: 'russia_continent_border'
      };

      var coordinateList = coordinateLists[id];

      var geojsonObject = createGeojsonObject(
        coordinateList,
        properties);
      geojsonObject.features[0].geometry.type = 'MultiLineString';

      fs.writeFileSync('geojsonDatasets/russia_boundary.json', JSON.stringify(geojsonObject, null, '  '));
    }
  }
});
