
function createGeojsonMultiPolygonObject(coordinates, properties) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: properties,
        geometry: {
          type: 'MultiPolygon',
          coordinates: coordinates.map(function(x) { return [x.slice()]; })
        }
      }
    ]
  };
}

module.exports = createGeojsonMultiPolygonObject;
