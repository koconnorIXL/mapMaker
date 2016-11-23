var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');

function sanitize(name) {
  return name = name
    .replace(/ /g, '_')
    .replace('(', '')
    .replace(')', '')
};

function getFileName(directory, name) {
  return 'topojsonDatasets/ocean.json';
}

var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.1;
var SIMPLIFY_MINIMUM_AREA_CONTINENTAL = 0.007;
var SIMPLIFY_MINIMUM_AREA_LOCAL = 0.001;

var SMALL_ISLAND_THRESHOLD_GLOBAL = 3;
var SMALL_ISLAND_THRESHOLD_LOCAL = 0.0001;

var standardProjection = d3.geo.equirectangular();
var continentalSimplifyOptions = {
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
  return JSON.parse(fs.readFileSync('geojsonDatasets/oceans.json'));
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
  'coordinate-system': 'spherical',
  'minimum-area': 1e-6
};

// Can't simplify... otherwise get problems with southern boundary of Atlantic ocean.
topology = topojson.simplify(topology, globalSimplifyOptions);
topology.objects.oceans = topology.objects.collection;
delete topology.objects.collection;

fs.writeFileSync('topojsonDatasets/oceans.json', JSON.stringify(topology));


// Also convert water boundaries dataset to topojson.
var data = JSON.parse(fs.readFileSync('geojsonDatasets/water_boundaries.json'));
var waterBoundariesTopology = topojson.topology({collection: data}, options);
topology.objects.water_boundaries = topology.objects.collection;
delete topology.objects.collection;

fs.writeFileSync('topojsonDatasets/water_boundaries.json');

