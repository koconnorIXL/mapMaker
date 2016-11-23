var fs = require('fs');
var xml2js = require('xml2js');
var convertPathToCoordinateList = require('./ConvertPathToCoordinates.js');
var convertPolygonToCoordinateList = require('./ConvertPolygonToCoordinates.js');

var propMap = require('./NewTerritoryPropMap.js');

function parseAndWrite(svgFilename, d3Projection, callback) {

  var svgString = fs.readFileSync(svgFilename);
  xml2js.parseString(svgString, function(err, result) {
    var gs = result.svg.g;

    var result = {};
    gs.forEach(function(g) {
      var attrs = g.$;
      var id = attrs.id;
      var properties = propMap[id];
      var paths = g.path;
      var polygons = g.polygon;

      if (id.indexOf('yui') > -1) {
        return;
      }

      var geojsonObject;
      var reverseGeojsonObject;
      var coordinates = [];
      if (paths) {
        var coords = paths.map(function(path) {
          var pathD = path.$.d;
          var coordinateList = convertPathToCoordinateList(pathD)
            .map(function(p) { return d3Projection.invert(p); });
          return coordinateList;
        });
        coordinates = coordinates.concat(coords);
      }
      if (polygons) {
        var coords = polygons.map(function(polygon) {
          var ps = polygon.$.points;
          var coordinateList = convertPolygonToCoordinateList(ps)
            .map(function(p) { return d3Projection.invert(p); });
            return coordinateList;
        });
        coordinates = coordinates.concat(coords);
      } 
      result[id] = coordinates;
    });

    callback(result);
  });
}

module.exports = parseAndWrite;

