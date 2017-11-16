var d3 = require('d3');


var REMOVED = 'REMOVED';
var MODIFIED = 'MODIFIED';
var NO_CHANGE = 'NO_CHANGE';

var US_THRESHOLD = 0.1;

exports.removeDonuts = function removeDonuts(geojson, d3Path, minArea, properties) {
  
  switch(geojson.type) {
    case 'Polygon':
      var oldGeometry = geojson.coordinates;
      if (oldGeometry.length > 1) {
        geojson.coordinates = [oldGeometry[0]];
        return MODIFIED;
      }
      else {
        return NO_CHANGE;
      }
    case 'MultiPolygon':
      var retStatus = NO_CHANGE;
      for (var i = 0; i < geojson.coordinates.length; i++) {
        var oldGeometry = geojson.coordinates[i];
        if (oldGeometry.length > 1) {
          geojson.coordinates[i] = [oldGeometry[0]];
          retStatus = MODIFIED;
        }
      }
      return retStatus;
    case 'GeometryCollection':
      var newGeos = geojson.geometries.filter(function(geo) {
        return removeDonuts(geo, d3Path, minArea) !== REMOVED;
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
      var res = removeDonuts(geojson.geometry, d3Path, minArea, geojson.properties);
      if (res === REMOVED) {
        geojson.geometry = null;
      }
      return res;
    case 'FeatureCollection':
      var newFeatures = geojson.features.filter(function(feature) {
        return removeDonuts(feature, d3Path, minArea) !== REMOVED;
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

