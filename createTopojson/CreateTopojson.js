var topojson = require('topojson');
var MapColoring = require('../MapColoring.js');

var SimplifyOptions = require('./SimplifyOptions.js');
var TopojsonOptions = require('./TopojsonOptions.js');

function createTopojson(geojson, topojsonOptions, simplifyOptions) {
  topojsonOptions = topojsonOptions || TopojsonOptions.standard(); 
  simplifyOptions = simplifyOptions !== undefined 
    ? simplifyOptions
    : SimplifyOptions.standardGlobal();

  // Convert this data to topojson
  var topology = topojson.topology({collection: geojson}, topojsonOptions);
  
  // Simplify this data
  if (simplifyOptions !== null) {
    topology = topojson.simplify(topology, simplifyOptions);
  }
  
  return topology;
}

module.exports = createTopojson;
