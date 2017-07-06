var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var createTopojson = require('./createTopojson/CreateTopojson.js');
var SimplifyOptions = require('./createTopojson/SimplifyOptions.js');
var TopojsonOptions = require('./createTopojson/TopojsonOptions.js');
var sanitize = require('./createTopojson/sanitize-filename.js');
var DisputedMap = require('./createTopojson/DisputedMap.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;

var geojsonFilename = 'countries_high_res.json';

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

var RANDOM_SUBGROUPS = {
  'US_border_countries': [
    'Canada',
    'Mexico',
    'Russia'
  ]
};

var STATES_TO_NOT_SIMPLIFY = [
  'Rhode Island',
  'Maryland',
  'Massachusetts',
  'California',
  'Michigan',
  'Wisconsin'
];

var SMALL_ISLAND_THRESHOLD_CONTINENTAL = 0.05;
var standardProjection = d3.geo.equirectangular();

function getFileName(directory, name) {
  return 'topojsonDatasets/countries/' + directory + '/' + name + '.json';
}

function getFreshData() {
  // Get the geojson data.
  return JSON.parse(fs.readFileSync('geojsonDatasets/' + geojsonFilename));
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

topology.objects.countries = topology.objects.collection;
delete topology.objects.collection;

// add a mapcolor5 field to the topojson
var geometryCollection = topology.objects.countries.geometries;


fs.writeFileSync('topojsonDatasets/countries/all_countries/countries.json', JSON.stringify(topology));

// Next, create one dataset for each continent, containing medium-res data for the
// boundary of every country in that continent.
CONTINENTS.forEach(function(continentName) {

  // Get all the features associated to this continent
  var continentData = getFreshData().features.filter(function(feature) { 
    var continentTag = feature.properties.continent || feature.properties.CONTINENT;
    return continentTag === continentName;
  }); 
  var featureCollection = { 
    type: 'FeatureCollection',
    features: continentData
  };

  continentData.forEach(function(feature) {
    if (feature.properties.admin === 'United States of America'
      && STATES_TO_NOT_SIMPLIFY.indexOf(feature.properties.name) === -1)
    {
      removeSmallIslands(feature, d3.geo.path().projection(standardProjection), SMALL_ISLAND_THRESHOLD_CONTINENTAL);
    }
  });

  var filename = getFileName('continents', sanitize(continentName + '_countries'));
  
  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.standard(),
    SimplifyOptions.standardContinental());

  topology.objects[sanitize(continentName + '_countries')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});

Object.keys(RANDOM_SUBGROUPS).forEach(function(subgroupName) {
  var groupCountries = RANDOM_SUBGROUPS[subgroupName];
  var data = getFreshData().features.filter(function(feature) {
    var name = feature.properties.name || feature.properties.NAME;
    var admin = feature.properties.admin || feature.properties.ADMIN;
    return groupCountries.indexOf(name) > -1 || groupCountries.indexOf(admin) > -1;
  });

  var featureCollection = {
    type: 'FeatureCollection',
    features: data
  };

  var filename = getFileName('misc', sanitize(subgroupName));
  
  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.standard(),
    SimplifyOptions.standardContinental());

  topology.objects[sanitize(subgroupName)] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});

// Next, create one dataset for each country, containing high-res data for the boundary of that 
// individual country.
getFreshData().features.forEach(function(countryFeature) {
  var featureCollection = {
    type: 'FeatureCollection',
    features: [countryFeature]
  };

  var name = countryFeature.properties.name || countryFeature.properties.NAME;

  var filename = getFileName('countries_high_res', sanitize(name + '_high_res'));

  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.highRes(),
    null);


  topology.objects[sanitize(name + '_high_res')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});



// Next, create one dataset for each country, containing medium-res data for the boundary of that 
// individual country.
getFreshData().features.forEach(function(countryFeature) {
  var featureCollection = {
    type: 'FeatureCollection',
    features: [countryFeature]
  };

  var name = countryFeature.properties.name || countryFeature.properties.NAME;

  var filename = getFileName('countries_medium_res', sanitize(name + '_medium_res'));

  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.highRes(),
    SimplifyOptions.standardContinental());


  topology.objects[sanitize(name + '_medium_res')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});


// Next, create one dataset for every region with external claims and/or claimers. The dataset
// should contain the original feature, plus all of its claims and claimers.

function getFreshFeatureMap() {
  var ALL_FEATURES = {};
  getFreshData().features.forEach(function(feature) {
    ALL_FEATURES[feature.properties.name || feature.properties.NAME] = feature;
  });
  return ALL_FEATURES;
}

var all_features = getFreshFeatureMap();
Object.keys(DisputedMap).forEach(function(regionName) {
  var featureCollection = {
    type: 'FeatureCollection',
    features: DisputedMap[regionName].map(function(name) { return all_features[name]; })
  };

  var filename = getFileName('countries_high_res_with_disputed', sanitize(regionName + '_with_disputed_high_res'));

  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.highRes(),
    null);

  topology.objects[sanitize(regionName + '_high_res')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
  all_features = getFreshFeatureMap();
});


all_features = getFreshFeatureMap();
Object.keys(DisputedMap).forEach(function(regionName) {
  var featureCollection = {
    type: 'FeatureCollection',
    features: DisputedMap[regionName].map(function(name) { return all_features[name]; })
  };

  var filename = getFileName('countries_medium_res_with_disputed', sanitize(regionName + '_with_disputed_medium_res'));

  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.standard(),
    SimplifyOptions.standardContinental());

  topology.objects[sanitize(regionName + '_medium_res')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
  all_features = getFreshFeatureMap();
});


