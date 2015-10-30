var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');

var datasetsToModify = [
  'admin1_high_res.json'
];

var DO_NOT_SIMPLIFY = [
  'Rhode Island',
  'Maryland',
  'Massachusetts',
  'California'
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
  subDatasets = subDatasets.map(function(subDataset) {

    if (DO_NOT_SIMPLIFY.indexOf(subDataset.features[0].properties.name) > -1) {
      removeSmallIslands(subDataset, d3.geo.path().projection(standardProjection), SMALL_ISLAND_THRESHOLD_GLOBAL);
    }

    var topology = topojson.topology({collection: subDataset}, options);  
    
    var retVal = topojson.merge(topology, topology.objects.collection.geometries);
    if (topology.objects.collection.geometries.length > 0) {
      if (DO_NOT_SIMPLIFY.indexOf(topology.objects.collection.geometries[0].properties.name) > -1) {
        topology = topojson.simplify(topology, simplifyOptions);
      }

      retVal.properties = topology.objects.collection.geometries[0].properties;
    }
    else {
      console.log(subDataset);
    }


    return retVal;
  });

  var aggregateGeojson = {
    'type': 'FeatureCollection',
    'features': subDatasets.map(function(subDataset) { 
      var props = subDataset.properties;
      delete subDataset.properties;
      return {
        'type': 'Feature',
        'geometry': subDataset,
        'properties': props
      };
    })
  };
  
  var topojsonData = topojson.topology({collection: aggregateGeojson}, options);
  topojsonData.objects[filename.slice(0, filename.length - 5)] = topojsonData.objects.collection;
  topojsonData.objects.collection = null;

  // add a mapcolor5 field to the topojson
  var geometryCollection = topojsonData.objects[filename.slice(0, filename.length - 5)].geometries;

  var fiveColoring = MapColoring.fastFiveColoring(geometryCollection);
  
  for (var i = 0; i < geometryCollection.length; i++) {
    if (geometryCollection[i] && geometryCollection[i].properties) {
      geometryCollection[i].properties.mapcolor5 = fiveColoring[i];
    }
  }

  fs.writeFile('topojsonDatasets/' + filename.slice(0, filename.length - 5) + '.json', JSON.stringify(topojsonData));
});

