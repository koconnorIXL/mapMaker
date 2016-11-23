var createGeojsonPolygonObject = require('./CreateGeojsonPolygonObject');
var createGeojsonMultiPolygonObject = require('./CreateGeojsonMultiPolygonObject');

function createGeojsonObject(coordinates, properties) {
  if (coordinates.length === 1) {
    return createGeojsonPolygonObject(coordinates, properties);
  }
  else {
    return createGeojsonMultiPolygonObject(coordinates, properties);
  }
}

module.exports = createGeojsonObject;

