var d3 = require('d3');


var REMOVED = 'REMOVED';
var MODIFIED = 'MODIFIED';
var NO_CHANGE = 'NO_CHANGE';

var US_THRESHOLD = 0.1;

exports.removeSmallIslands = function removeSmallIslands(geojson, d3Path, minArea, properties) {
  
  switch(geojson.type) {
    case 'Polygon':
      if (d3Path.area(geojson) >= minArea) {
        return NO_CHANGE;
      }
      // Don't remove small paths in the US (i.e. Hawaii, Alaska, Rhode Island).
//      else if ((properties && properties.admin === "United States of America") && d3Path.area(geojson) >= US_THRESHOLD) {
//        return NO_CHANGE;
//      }
      else {
        geojson.coordinates = [];
        return REMOVED;
      }

    case 'MultiPolygon':
      var newCoords = geojson.coordinates.filter(function(polygon) {
        if (d3Path.area({ type: 'Polygon', coordinates: polygon}) > minArea) {
          return true;
        }
        // Don't remove small paths in the US (i.e. Hawaii, Alaska, Rhode Island).
        if (properties && properties.admin === "United States of America" && (d3Path.area({ type: 'Polygon', coordinates: polygon}) > US_THRESHOLD)) {
          return true;
        }
        return false;
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
      var res = removeSmallIslands(geojson.geometry, d3Path, minArea, geojson.properties);
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

