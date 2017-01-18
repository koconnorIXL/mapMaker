
function findLongestForPolygonCoordinates(coordinates) {
  var longest = coordinates[0];
  var index = 0;
  for (var i = 1; i < coordinates.length; i++) {
    if (coordinates[i].length > longest.length) {
      longest = coordinates[i];
      index = i;
    }
  }
  return {
    index: index,
    coordinates: longest
  };
}

function findLongestForMultiPolygonCoordinates(coordinates) {
  var longest = findLongestForPolygonCoordinates(coordinates[0]);
  var polygonIndex = 0;
  for (var i = 1; i < coordinates.length; i++) {
    var longestFromPolygon = findLongestForPolygonCoordinates(coordinates[i]);
    if (longestFromPolygon.coordinates.length > longest.coordinates.length) {
      polygonIndex = i;
      longest = longestFromPolygon;
    }
  }

  return {
    polygonIndex: polygonIndex,
    index: longest.index,
    coordinates: longest.coordinates
  };
}

module.exports = function(feature) {
  if (feature.geometry.type === 'MultiPolygon') {
    return findLongestForMultiPolygonCoordinates(feature.geometry.coordinates);
  }
  else if (feature.geometry.type === 'Polygon') {
    return findLongestForPolygonCoordinates(feature.geometry.coordinates);
  }
};

    
