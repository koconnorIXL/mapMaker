var fs = require('fs');
var xml2js = require('xml2js');
var createGeojsonObject = require('./CreateGeojsonObject.js');
var convertPathToCoordinateList = require('./ConvertPathToCoordinates.js');
var convertPolygonToCoordinateList = require('./ConvertPolygonToCoordinates.js');

var propMap = require('./NewTerritoryPropMap.js');
var getProjection = require('./GetProjectionUsedForIllustrationSVG.js');


var d3Projection = getProjection();

var svgString = fs.readFileSync('disputed-borders-base-map.svg');
xml2js.parseString(svgString, function(err, result) {
  var gs = result.svg.g;
  gs.forEach(function(g) {
    var attrs = g.$;
    var id = attrs.id;
    var properties = propMap[id];
    var paths = g.path;
    var polygons = g.polygon;
    if (id.indexOf('yui') === -1) {
      var geojsonObject;
      var reverseGeojsonObject;
      if (paths) {
        var path = paths[0];
        var pathD = path.$.d;
        var coordinateList = convertPathToCoordinateList(pathD);
        var coordinateListReversed = coordinateList.slice().reverse();
        geojsonObject = createGeojsonObject(
          coordinateList.map(function(p) { return d3Projection.invert(p); }),
          properties);
        reverseGeojsonObject = createGeojsonObject(
          coordinateListReversed.map(function(p) { return d3Projection.invert(p); }),
          properties);
      }
      if (polygons) {
        var polygon = polygons[0];
        var ps = polygon.$.points;
        var coordinateList = convertPolygonToCoordinateList(ps);
        var coordinateListReversed = coordinateList.slice().reverse();
        geojsonObject = createGeojsonObject(
          coordinateList.map(function(p) { return d3Projection.invert(p); }),
          properties);
        reverseGeojsonObject = createGeojsonObject(
          coordinateListReversed.map(function(p) { return d3Projection.invert(p); }),
          properties);
      }

      fs.writeFileSync('geojsonDatasets/' + id + '.json', JSON.stringify(geojsonObject, null, '  '));
      fs.writeFileSync('geojsonDatasets/' + id + '-min.json', JSON.stringify(geojsonObject));
      fs.writeFileSync('geojsonDatasets/' + id + '-reversed.json', JSON.stringify(reverseGeojsonObject, null, '  '));
      fs.writeFileSync('geojsonDatasets/' + id + '-reversed-min.json', JSON.stringify(reverseGeojsonObject));
    }
  });
});


