var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');

var datasetsToModify = [
  'countries.json',
  'admin1.json',
  'usa.json'
];

var standardProjection = d3.geo.equirectangular();

var REMOVED = 'REMOVED';
var MODIFIED = 'MODIFIED';
var NO_CHANGE = 'NO_CHANGE';

function removeSmallIslands(geojson, d3Path, minArea) {
  
  switch(geojson.type) {
    case 'Polygon':
      if (d3Path.area(geojson) < minArea) {
        geojson.coordinates = [];
        return REMOVED;
      }
      else {
        return NO_CHANGE;
      }
    case 'MultiPolygon':
      var newCoords = geojson.coordinates.filter(function(polygon) {
        return d3Path.area({ type: 'Polygon', coordinates: polygon}) > minArea;
      });
      var oldNumPolys = geojson.coordinates.length;
      geojson.coordinates = newCoords;
      if (newCoords.length === 0) {
        return REMOVED;
      }
      else if (newCoords.length < oldNumPolys) {
        return MODIFIED;
      }
      else {
        return NO_CHANGE;
      }
    case 'GeometryCollection':
      var newGeos = geojson.geometries.filter(function(geo) {
        return removeSmallIslands(geo, d3Path, minArea) !== REMOVED;
      });
      var oldNumGeos = geojson.geometries.length;
      geojson.geometries = newGeos;
      if (newGeos.length === 0) {
        return REMOVED;
      }
      else if (newGeos.length < oldNumGeos) {
        return MODIFIED;
      }
      else {
        return NO_CHANGE;
      }
    case 'Feature':
      var res = removeSmallIslands(geojson.geometry, d3Path, minArea);
      if (res === REMOVED) {
        geojson.geometry = null;
      }
      return res;
    case 'FeatureCollection':
      var newFeatures = geojson.features.filter(function(feature) {
        return removeSmallIslands(feature, d3Path, minArea) !== REMOVED;
      });
      var oldNumFeatures = geojson.features.length;
      geojson.features = newFeatures;
      if (newFeatures.length === 0) {
        return REMOVED;
      }
      else if (newFeatures.length < oldNumFeatures) {
        return MODIFIED;
      }
      else {
        return NO_CHANGE;
      }
    default:
      return NO_CHANGE;
  }
}

datasetsToModify.forEach(function(filename) {

  // Get the geojson data.
  var data = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));
  
  // Prune some small islands out of the geojson data.
  removeSmallIslands(data, d3.geo.path().projection(standardProjection), 5);

  // convert the geojson to topojson
  var options = {
    "property-transform": function(x) { return x.properties; }
  };
  var topojsonData = topojson.topology({collection: data}, options);
  topojsonData.objects[filename.slice(0, filename.length - 5)] = topojsonData.objects.collection;
  topojsonData.objects.collection = null;

  // smooth out some of the really detailed boundaries
  var simplifyOptions = {
    'coordinate-system': 'cartesian',
    'minimum-area': 0.02
  };
  topojsonData = topojson.simplify(topojsonData, simplifyOptions);

  // add a mapcolor5 field to the topojson
  var geometryCollection = topojsonData.objects[filename.slice(0, filename.length - 5)].geometries;

  var fiveColoring = MapColoring.fastFiveColoring(geometryCollection);

  for (var i = 0; i < geometryCollection.length; i++) {
    geometryCollection[i].properties.mapcolor5 = fiveColoring[i];
  }

  fs.writeFile('topojsonDatasets/' + filename.slice(0, filename.length - 5) + '.json', JSON.stringify(topojsonData));
});

