var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');

var datasetsToHandle = [
  //'countries.json',
  'admin1.json'
  // 'usa.json',
  // 'disputed_boundaries.json',
  // 'USSR-geojson.json'
];

datasetsToHandle.forEach(function(filename) {
  var name = filename.slice(0, filename.length - 5);


  // Get the data.
  console.log('reading ' + './topojsonDatasetsRaw/' + filename);
  var json = JSON.parse(fs.readFileSync('./topojsonDatasetsRaw/' + filename));
  
  // We need a projection to use for getting the bounds of the paths.
  var standardProjection = d3.geo.mercator();
  var path = d3.geo.path().projection(standardProjection);
  var features = topojson.feature(json, json.objects[name]).features;
  var pathNameToBounds = {};
  var pathNameToCentroid = {};
  var pathNameToNeighbors = {};

  var neighbors = topojson.neighbors(json.objects[name].geometries);
  
  // Get the bounds for all paths and store them.
  for (var i = 0; i < features.length; i++) {
    var feature = features[i];
    var bounds = path.bounds(feature);
    // Note: For US states from usa.json, use NAME_1, not name.
    pathNameToBounds[feature.properties.name] = {
      leftX: bounds[0][0],
      topY: bounds[0][1],
      rightX: bounds[1][0],
      bottomY: bounds[1][1]
    };
    pathNameToCentroid[feature.properties.name] = path.centroid(feature);
    pathNameToNeighbors[feature.properties.name] = neighbors[i].map(function(j) { return features[j].properties.name; });
  }

  var neighbors = {};

  for (var currPath in pathNameToBounds) {
    console.log('finding neighbors for ' + currPath);
    var currPathData = pathNameToBounds[currPath];
    var currPathCentroid = pathNameToCentroid[currPath];

    neighbors[currPath] = {};

    var allNeighbors = pathNameToNeighbors[currPath];
    
    var closestNorthDTheta = null;
    var closestSouthDTheta = null;
    var closestWestDTheta = null;
    var closestEastDTheta = null;
    for (var i = 0; i < allNeighbors.length; i++) {
      var otherPath = allNeighbors[i];
      var otherPathCentroid = pathNameToCentroid[otherPath];

      var diffX = otherPathCentroid[0] - currPathCentroid[0];
      var diffY = otherPathCentroid[1] - currPathCentroid[1];

      var angle = Math.atan2(diffY, diffX);
      
      console.log('trying out ' + otherPath + ' angle is ' + angle);
      if (-Math.PI / 2 < angle && angle < Math.PI / 2) {
        if (!closestEastDTheta || (Math.abs(angle - 0) < closestEastDTheta)) {
          neighbors[currPath]['east'] = otherPath;
          closestEastDTheta = Math.abs(angle - 0);
        }
      }
      if (0 < angle && angle < Math.PI) {
        console.log('south candidate', closestSouthDTheta);
        if (!closestSouthDTheta || Math.abs(angle - Math.PI / 2) < closestSouthDTheta) {
          neighbors[currPath]['south'] = otherPath;
          closestSouthDTheta = Math.abs(angle - Math.PI / 2);
        }
      }
      if (-Math.PI < angle && angle < 0) {
        console.log('north candidate', closestNorthDTheta, Math.abs(angle - (-Math.PI / 2)));
        if (!closestNorthDTheta || Math.abs(angle - (-Math.PI / 2)) < closestNorthDTheta) {
          neighbors[currPath]['north'] = otherPath;
          closestNorthDTheta = Math.abs(angle - (-Math.PI / 2));
        }
      }
      if (angle < -Math.PI / 2 || Math.PI / 2 < angle) {
        if (!closestWestDTheta || Math.PI - Math.abs(angle) < closestWestDTheta) {
          neighbors[currPath]['west'] = otherPath;
          closestWestDTheta = Math.PI - Math.abs(angle);
        }
      }
    }
  }

  fs.writeFile('./neighborData_' + name + '.json', JSON.stringify(neighbors, null, 2), function (err) { 
    console.log('trying to save...');
    if (err) throw err; 
    console.log("saved " + name);
  });
});

