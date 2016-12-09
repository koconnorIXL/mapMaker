var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');

var datasetsToModify = [
  'countries_custom_disputed_boundaries.json'
];

var CONTINENTS = [
  'North America',
  'South America',
  'Africa',
  'Europe',
  'Asia',
  'Oceania',
  'Antarctica',
  'Seven seas (open ocean)'
];

function getFileName(continentName) {
  continentName = continentName
    .replace(/ /g, '_')
    .replace('(', '')
    .replace(')', '')
  return 'topojsonDatasets/' + continentName + '_countries_low_res.json'
}

var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.1;
var SIMPLIFY_MINIMUM_AREA_LOCAL = 0.001;

var SMALL_ISLAND_THRESHOLD_GLOBAL = 3;
var SMALL_ISLAND_THRESHOLD_LOCAL = 0.0001;

function getFreshData(filename) {
  // Get the geojson data.
  var data = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));

  return data.features.map(function(feature) {
    return {
      'type': 'FeatureCollection',
      'features': [feature]
    };
  });
}
  

datasetsToModify.forEach(function(filename) {

  // Get the geojson data.
  var data = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));

  var standardProjection = d3.geo.equirectangular();
  var simplifyOptions = {
    'coordinate-system': 'cartesian',
    'minimum-area': SIMPLIFY_MINIMUM_AREA_GLOBAL
  };
  var options = {
    "property-transform": function(x) { return x.properties; }
  };


  CONTINENTS.forEach(function(continentName) {
    var continentData = data.features.filter(function(feature) { 
      return feature.properties.continent === continentName;
    }); 
    var featureCollection = { 
      type: 'FeatureCollection',
      features: continentData
    };

    var filename = getFileName(continentName);
    
    var topology = topojson.topology({collection: featureCollection}, options);
    topology = topojson.simplify(topology, simplifyOptions);
    topology.objects[filename.substring(17, filename.length - 5)] = topology.objects.collection;
    delete topology.objects.collection;
    fs.writeFile(filename, JSON.stringify(topology));
  });
});

