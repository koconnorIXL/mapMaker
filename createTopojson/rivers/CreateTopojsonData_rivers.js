var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var createTopojson = require('../CreateTopojson.js');
var SimplifyOptions = require('../SimplifyOptions.js');
var TopojsonOptions = require('../TopojsonOptions.js');
var sanitize = require('../sanitize-filename.js');

var geojsonFilename = 'rivers.json';

var RANDOM_SUBGROUPS = {
  'Congo River': [
    'Congo',
    'Lualaba (Congo)',
    'Congo (extension)'
  ],
  'Gambia River': [
    "Gambia"
  ],
  'Panama Canal': [
    'Panama Canal'
  ]
};

function getFileName(name) {
  return '../../topojsonDatasets/rivers/' + name + '.json';
}

function getFreshData() {
  // Get the geojson data.
  return JSON.parse(fs.readFileSync('../../geojsonDatasets/' + geojsonFilename));
}

// Get the geojson data.
var data = getFreshData(); 


// First, create one big dataset which contains low-res data for the boundary
// of every country in the world.

// Convert this data to topojson
var topology = createTopojson(
  data,
  TopojsonOptions.standard(),
  // Simplify the topojson data; this dataset is intended to contain low-res data for each
  // country, so simplification can be pretty aggressive. (If we stored high-resolution
  // data for the boundary of every country in the world in this single dataset, the
  // dataset size would be prohibitively large).
  SimplifyOptions.standardGlobal());

topology.objects.rivers_high_res = topology.objects.collection;
delete topology.objects.collection;
fs.writeFileSync(getFileName('rivers_high_res', JSON.stringify(topology)));

// Next, create one dataset with only high-scalerank rivers.
var filteredData = getFreshData().features.filter(function(feature) { 
  return parseInt(feature.properties.scalerank) > 9;
}); 
var featureCollection = { 
  type: 'FeatureCollection',
  features: filteredData
};

var filename = getFileName('large_rivers');

var topology = createTopojson(
  featureCollection,
  TopojsonOptions.standard(),
  SimplifyOptions.standardContinental());

topology.objects.large_rivers = topology.objects.collection;
delete topology.objects.collection;
fs.writeFileSync(filename, JSON.stringify(topology));


// Special subgroups of rivers get their own datasets
Object.keys(RANDOM_SUBGROUPS).forEach(function(subgroupName) {
  var groupCountries = RANDOM_SUBGROUPS[subgroupName];
  var data = getFreshData().features.filter(function(feature) {
    var name = feature.properties.name || feature.properties.NAME;
    return groupCountries.indexOf(name) > -1;
  });

  var featureCollection = {
    type: 'FeatureCollection',
    features: data
  };

  var filename = getFileName(sanitize(subgroupName));
  
  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.standard(),
    null);

  topology.objects[sanitize(subgroupName)] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});

