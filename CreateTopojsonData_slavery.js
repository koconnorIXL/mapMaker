// This file was used to create slavery maps. This is the step after ogr2ogr work.
var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var createTopojson = require('./createTopojson/CreateTopojson.js');
var SimplifyOptions = require('./createTopojson/SimplifyOptions.js');
var TopojsonOptions = require('./createTopojson/TopojsonOptions.js');
var sanitize = require('./createTopojson/sanitize-filename.js');
var DisputedMap = require('./createTopojson/DisputedMap.js');

var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var removeDonuts = require('./RemoveDonuts.js').removeDonuts;
var SMALL_ISLAND_THRESHOLD = 0.02;

// Paths to the desired input and output files.
var geojsonFilepath = process.argv[2];
var outputFilepath = process.argv[3];

function getFreshData() {
  // Get the geojson data.
  return JSON.parse(fs.readFileSync(geojsonFilepath));
}

function getTopojsonGeometryFromTopology(json) {
  var objects = json.objects;
  for (var key in objects) {
    if (objects.hasOwnProperty(key) && objects[key] && objects[key].type) {
      return objects[key];
    }
  }
}

// Get the geojson data.
var data = getFreshData();
removeSmallIslands(data, d3.geo.path().projection(d3.geo.equirectangular()), SMALL_ISLAND_THRESHOLD);

// Convert this data to topojson.
var topology = createTopojson(
  data,
  TopojsonOptions.standard(),
  SimplifyOptions.standardContinental());

// Remove small islands and donuts after simplification.
var dataAfterSimplification = topojson.feature(topology, getTopojsonGeometryFromTopology(topology));
removeSmallIslands(dataAfterSimplification, d3.geo.path().projection(d3.geo.equirectangular()), SMALL_ISLAND_THRESHOLD);
removeDonuts(dataAfterSimplification, d3.geo.path().projection(d3.geo.equirectangular()), SMALL_ISLAND_THRESHOLD);

// Include only the necessary properties. Set the name property to be the unique ID of the counties.
// The code will add a mapping from the ID to its desired color.
dataAfterSimplification.features.forEach(
  function(feature) {
    var original = feature.properties;
    feature.properties = {
      name: original.gisjoin
      //county: original.nhgisnam,
      //state: original.statenam
    }
  });

// Convert this data to topojson
var topology2 = createTopojson(
  dataAfterSimplification,
    TopojsonOptions.standard(),
    SimplifyOptions.standardContinental());

fs.writeFileSync(outputFilepath, JSON.stringify(topology2));
