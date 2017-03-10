var fs = require('fs');

/**
 * Usage: node forceClockwiseRotation.js [filePath1] [filePath2] ...
 * For each GeoJSON file path, parse the file and examine the coordinates of each feature.
 * Convert all counter-clockwise paths to be clockwise.
 */

var filePaths = process.argv.slice(2);

/**
 * To calculate the rotation, sum over each edge (x2 − x1) * (y2 + y1). Positive indicates
 * clockwise; negative indicates counter-clockwise.
 * http://stackoverflow.com/a/1165943
 */
function checkRotation(arr) {
  var total = 0;
  var first, second;
  for (var i = 0; i < arr.length; i++) {
    if (i === (arr.length - 1)) {
      first = arr[i];
      second = arr[0];
    }
    else {
      first = arr[i];
      second = arr[i+1];
    }
    
    total += (second[0]-first[0])*(second[1]+first[1]);
  }

  return total;
}

// For each
filePaths.forEach(function(filePath) {
  // Read file.
  var data = JSON.parse(fs.readFileSync(filePath));

  data.features.forEach(function(feature, j) {
    var rotationValue = checkRotation(feature.geometry.coordinates[0]);

    // Reverse all counter-clockwise to clockwise.
    if (rotationValue < 0) {
      data.features[j].geometry.coordinates[0] = data.features[j].geometry.coordinates[0].reverse();
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data));
});
