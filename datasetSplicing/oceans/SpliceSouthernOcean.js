var createSouthernOceanCoordinates = require('./CreateSouthernOceanCoordinates.js');


function spliceSouthernOcean(coordinates) {
  var index = 0;
  for (index = 0; index < coordinates.length - 1; index++) {
    var p1 = coordinates[index];
    var p2 = coordinates[index + 1];
    if (p1[1] < -60 && p2[1] < -60 && Math.abs(p1[0] - p2[0]) > 50) {
      var args = [index + 1, 0].concat(createSouthernOceanCoordinates(p1[0], p2[0], 1e2));
      Array.prototype.splice.apply(coordinates, args); 
      break;
    }
  }
  return coordinates;
}

module.exports = spliceSouthernOcean;

