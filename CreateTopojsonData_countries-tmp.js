var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');
var SmallAreaProps = require('./smallAreas/SmallAreaProps.js');

var geojsonFilename = 'countries_high_res-tmp.json';

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

function sanitize(name) {
  return name = name
    .replace(/ /g, '_')
    .replace('(', '')
    .replace(')', '')
};

function getFileName(directory, name) {
  return 'topojsonDatasets/countries-tmp/' + directory + '/' + name + '.json';
}

var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.1;
var SIMPLIFY_MINIMUM_AREA_CARTESIAN_CONTINENTAL = 0.007;
var SIMPLIFY_MINIMUM_AREA_SPHERICAL_CONTINENTAL = 1e-6;
var SIMPLIFY_MINIMUM_AREA_LOCAL = 0.001;

var SMALL_ISLAND_THRESHOLD_GLOBAL = 3;
var SMALL_ISLAND_THRESHOLD_LOCAL = 0.0001;

var standardProjection = d3.geo.equirectangular();
var continentalSimplifyOptions = {
  'coordinate-system': 'cartesian',
  'minimum-area': SIMPLIFY_MINIMUM_AREA_CARTESIAN_CONTINENTAL
};
var options = {
  "property-transform": function(x) { for (var propName in x.properties) {
      var lowered = propName.toLowerCase();
      if (lowered !== propName) {
        x.properties[lowered] = x.properties[propName];
        delete x.properties[propName];
      }
    }
    return x.properties; 
  }
};

var high_res_options = {
  "property-transform": options["property-transform"],
  "quantization": 0
};

function getFreshData() {
  // Get the geojson data.
  return JSON.parse(fs.readFileSync('geojsonDatasets/' + geojsonFilename));
}

// Get the geojson data.
var data = getFreshData(); 


// First, create one big dataset which contains low-res data for the boundary
// of every country in the world.

// Convert this data to topojson
var topology = topojson.topology({collection: data}, options);

// Simplify the topojson data; this dataset is intended to contain low-res data for each
// country, so simplification can be pretty aggressive. (If we stored high-resolution
// data for the boundary of every country in the world in this single dataset, the
// dataset size would be prohibitively large).
var globalSimplifyOptions = {
  'coordinate-system': 'cartesian',
  'minimum-area': SIMPLIFY_MINIMUM_AREA_GLOBAL
};
topology = topojson.simplify(topology, globalSimplifyOptions);
topology.objects.countries = topology.objects.collection;
delete topology.objects.collection;

// add a mapcolor5 field to the topojson
var geometryCollection = topology.objects.countries.geometries;

var fiveColoring = MapColoring.fastFiveColoring(geometryCollection);

var FIVE_COLORING = {};
for (var i = 0; i < fiveColoring.length; i++) {
  var name = geometryCollection[i].properties.name;
  FIVE_COLORING[name] = fiveColoring[i];
}

for (var i = 0; i < geometryCollection.length; i++) {
  var geometry = geometryCollection[i];
  geometry.properties.mapcolor5 = FIVE_COLORING[geometry.properties.name]
}

fs.writeFileSync('topojsonDatasets/countries-tmp/all_countries/countries.json', JSON.stringify(topology));

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
  
  var topology = topojson.topology({collection: featureCollection}, options);
  topology = topojson.simplify(topology, continentalSimplifyOptions);
  for (var i = 0; i < topology.objects.collection.geometries.length; i++) {
    var geometry = topology.objects.collection.geometries[i];
    var name = geometry.properties.name || geometry.properties.NAME;
    geometry.properties.mapcolor5 = FIVE_COLORING[name]
  }
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
  var topology = topojson.topology({collection: featureCollection}, options);
  topology = topojson.simplify(topology, continentalSimplifyOptions);
  for (var i = 0; i < topology.objects.collection.geometries.length; i++) {
    var geometry = topology.objects.collection.geometries[i];
    var name = geometry.properties.name || geometry.properties.NAME;
    geometry.properties.mapcolor5 = FIVE_COLORING[name]
  }
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
  console.log(name);

  var filename = getFileName('countries_high_res', sanitize(name + '_high_res'));
  var topology = topojson.topology({collection: featureCollection}, high_res_options);
  for (var i = 0; i < topology.objects.collection.geometries.length; i++) {
    var geometry = topology.objects.collection.geometries[i];
    geometry.properties.mapcolor5 = FIVE_COLORING[name]
  }
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
  console.log(name);
  var countryFeature = all_features[name];

  var props = countryFeature.properties;
  var claims = (props.external_claims || []).concat(props.quasi_external_claims || []).map(function(x) { return all_features[x]; });
  var claimers = (props.claimed_by || []).concat(props.quasi_claimed_by || []).map(function(x) { return all_features[x]; });
  var mergeParents = (props.merge_into ? [props.merge_into] : []).map(function(x) { return all_features[x]; });
  var incomingMerges = (props.incoming_merges || []).map(function(x) { return all_features[x]; });
  var disputedBorderNeighbors = (props.disputed_border_with || []).map(function(x) { return all_features[x]; });
  
  if (claims.length + claimers.length + mergeParents.length + incomingMerges.length + disputedBorderNeighbors.length > 0) {
    //console.log(name);
    var featureCollection = {
      type: 'FeatureCollection',
      features: [countryFeature].concat(claims).concat(claimers).concat(mergeParents).concat(incomingMerges).concat(disputedBorderNeighbors)
    };


    var name = countryFeature.properties.name || countryFeature.properties.NAME;

    var filename = getFileName('countries_high_res_with_disputed', sanitize(name + '_with_disputed_high_res'));
    var topology = topojson.topology({collection: featureCollection}, high_res_options);
    for (var i = 0; i < topology.objects.collection.geometries.length; i++) {
      var geometry = topology.objects.collection.geometries[i];
      geometry.properties.mapcolor5 = FIVE_COLORING[geometry.properties.name || geometry.properties.NAME]
    }
    topology.objects[sanitize(name + '_high_res')] = topology.objects.collection;
    delete topology.objects.collection;
    fs.writeFileSync(filename, JSON.stringify(topology));
    all_features = getFreshFeatureMap();
  }
});
