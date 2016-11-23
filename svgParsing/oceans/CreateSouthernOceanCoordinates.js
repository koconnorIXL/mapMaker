
function createSouthernOceanCoordinates(minLongitude, maxLongitude, nPoints) {
  var coordinateList = [];
  for (var i = 0; i <= nPoints; i++) {
    coordinateList.push([minLongitude + i / nPoints * (maxLongitude - minLongitude), -60.2]);
  }
  return coordinateList;
}

module.exports = createSouthernOceanCoordinates;
