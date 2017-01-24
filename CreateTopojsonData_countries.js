var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./mapColoring/MapColoring.js');
var createTopojson = require('./createTopojson/CreateTopojson.js');
var SimplifyOptions = require('./createTopojson/SimplifyOptions.js');
var TopojsonOptions = require('./createTopojson/TopojsonOptions.js');
var sanitize = require('./createTopojson/sanitize-filename.js');

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

var FIVE_COLORING = MapColoring.createFiveColoringMap(geometryCollection);
MapColoring.applyColoringMap(geometryCollection, FIVE_COLORING);

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

  var filename = getFileName('continents', sanitize(continentName + '_countries'));
  
  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.standard(),
    SimplifyOptions.standardContinental());

  MapColoring.applyColoringMap(topology.objects.collection.geometries, FIVE_COLORING);
  topology.objects[sanitize(continentName + '_countries')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});

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

  var filename = getFileName('misc', sanitize(subgroupName));
  
  var topology = createTopojson(
    featureCollection,
    TopojsonOptions.standard(),
    SimplifyOptions.standardContinental());

  MapColoring.applyColoringMap(topology.objects.collection.geometries, FIVE_COLORING);
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

  MapColoring.applyColoringMap(topology.objects.collection.geometries, FIVE_COLORING);

  topology.objects[sanitize(name + '_high_res')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});


// Next, create one dataset for every region with a external claims and/or claimers. The dataset
// should contain the original feature, plus all of its claims and claimers.

function getFreshFeatureMap() {
  var ALL_FEATURES = {};
  getFreshData().features.forEach(function(feature) {
    ALL_FEATURES[feature.properties.name || feature.properties.NAME] = feature;
  });
  return ALL_FEATURES;
}

var all_features = getFreshFeatureMap();
Object.keys(getFreshFeatureMap()).forEach(function(name) {
  //console.log(name);
  var countryFeature = all_features[name];

  var props = countryFeature.properties;
  var claims = (props.external_claims || []).concat(props.quasi_external_claims || []).map(function(x) { return all_features[x]; });
  var claimers = (props.claimed_by || []).concat(props.quasi_claimed_by || []).map(function(x) { return all_features[x]; });
  var mergeParents = (props.merge_into ? [props.merge_into] : []).map(function(x) { return all_features[x]; });
  var incomingMerges = (props.incoming_merges || []).map(function(x) { return all_features[x]; });
  var disputedBorderNeighbors = (props.disputed_border_with || []).map(function(x) { return all_features[x]; });
  
  if (claims.length + claimers.length + mergeParents.length + incomingMerges.length + disputedBorderNeighbors.length > 0) {
    var featureCollection = {
      type: 'FeatureCollection',
      features: [countryFeature].concat(claims).concat(claimers).concat(mergeParents).concat(incomingMerges).concat(disputedBorderNeighbors)
    };


    var name = countryFeature.properties.name || countryFeature.properties.NAME;

    var filename = getFileName('countries_high_res_with_disputed', sanitize(name + '_with_disputed_high_res'));


    var topology = createTopojson(
      featureCollection,
      TopojsonOptions.highRes(),
      null);

    MapColoring.applyColoringMap(topology.objects.collection.geometries, FIVE_COLORING);

    topology.objects[sanitize(name + '_high_res')] = topology.objects.collection;
    delete topology.objects.collection;
    fs.writeFileSync(filename, JSON.stringify(topology));
    all_features = getFreshFeatureMap();
  }
});
