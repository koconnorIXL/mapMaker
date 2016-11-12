
function convertPolygonToCoordinates(polygonPointsAttribute) {
  return polygonPointsAttribute
    .trim()
    .split(' ')
    .filter(function(s) { return s.trim().length > 0; })
    .map(function(pString) { return pString.trim().split(',').map(function(num) { return parseFloat(num); }); });
}

module.exports = convertPolygonToCoordinates;
