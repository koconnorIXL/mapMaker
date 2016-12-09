var fs = require('fs');
var NPOINTS = 360;
function createCoordinates(nPoints) {
  var ps = [];
  for (var i = 0; i <= nPoints; i++) {
    ps.push([i * 360 / nPoints, 0]);
  }
  return ps;
}

var geometryCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        equator: true
      },
      geometry: {
        type: 'LineString',
        coordinates: createCoordinates(NPOINTS)
      }
    }
  ]
};

fs.writeFileSync('equator.json', JSON.stringify(geometryCollection, null, '  '));
