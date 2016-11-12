
function createGeojsonObject(coordinates, properties) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: properties,
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates.slice()]
        }
      }
    ]
  };
}

module.exports = createGeojsonObject;
