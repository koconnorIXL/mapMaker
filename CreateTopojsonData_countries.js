var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');

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

function sanitize(name) {
  return name = name
    .replace(/ /g, '_')
    .replace('(', '')
    .replace(')', '')
};

function getFileName(directory, name) {
  return 'topojsonDatasets/countries/' + directory + '/' + name + '.json';
}

var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.1;
var SIMPLIFY_MINIMUM_AREA_LOCAL = 0.001;

var SMALL_ISLAND_THRESHOLD_GLOBAL = 3;
var SMALL_ISLAND_THRESHOLD_LOCAL = 0.0001;

var standardProjection = d3.geo.equirectangular();
var simplifyOptions = {
  'coordinate-system': 'cartesian',
  'minimum-area': SIMPLIFY_MINIMUM_AREA_GLOBAL
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
  
  var topology = topojson.topology({collection: featureCollection}, options);
  topology = topojson.simplify(topology, simplifyOptions);
  for (var i = 0; i < topology.objects.collection.geometries.length; i++) {
    var geometry = topology.objects.collection.geometries[i];
    geometry.properties.mapcolor5 = FIVE_COLORING[geometry.properties.name]
  }
  topology.objects[sanitize(continentName + '_countries')] = topology.objects.collection;
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

  var filename = getFileName('countries_high_res', sanitize(countryFeature.properties.NAME + '_high_res'));
  var topology = topojson.topology({collection: featureCollection}, high_res_options);
  for (var i = 0; i < topology.objects.collection.geometries.length; i++) {
    var geometry = topology.objects.collection.geometries[i];
    geometry.properties.mapcolor5 = FIVE_COLORING[geometry.properties.name]
  }
  topology.objects[sanitize(countryFeature.properties.name + '_high_res')] = topology.objects.collection;
  delete topology.objects.collection;
  fs.writeFileSync(filename, JSON.stringify(topology));
});
