var fs = require('fs');
var createGeojsonObject = require('./CreateGeojsonObject.js');

var svgToGeojson = require('./SVGToGeographicCoordinates.js');

var propMap = require('./NewTerritoryPropMap.js');

var getProjection = require('./GetProjectionUsedForIllustrationSVG.js');
var d3Projection = getProjection();

svgToGeojson('disputed-borders-base-map_p3.svg', d3Projection, function(coordinateLists) {
  for (var id in coordinateLists) {
    if (coordinateLists.hasOwnProperty(id)) {
      var properties = propMap[id];
      geojsonObject = createGeojsonObject(
        coordinateLists[id],
        properties);
      fs.writeFileSync('geojsonDatasets/' + id + '.json', JSON.stringify(geojsonObject, null, '  '));
    }
  }
});

