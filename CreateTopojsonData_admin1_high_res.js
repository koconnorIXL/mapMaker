var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./mapColoring/MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');

var datasetsToModify = [
  'admin1_high_res.json'
];

var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.02;
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
  var subDatasets = getFreshData(filename);

  var standardProjection = d3.geo.equirectangular();
  var simplifyOptions = {
    'coordinate-system': 'cartesian',
    'minimum-area': SIMPLIFY_MINIMUM_AREA_LOCAL
  };
  var options = {
    "property-transform": function(x) { return x.properties; }
  };
  subDatasets = subDatasets.forEach(function(subDataset) {
    if (subDataset.features[0].properties.name) {
      var name = subDataset.features[0].properties.name.replace(new RegExp(' ', 'g'), '_');
      if (subDataset.features[0].properties.admin !== 'United States of America') {
        return;
      }
      var topology = topojson.topology({collection: subDataset}, options);  
      topology.objects[name] = topology.objects.collection;
      delete topology.objects.collection;
      
      fs.writeFile('topojsonDatasets/' + name + '_high_res.json', JSON.stringify(topology));
    }
  });
});

