var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');

var datasetsToModify = [
  'admin1.json'
];

var DO_NOT_SIMPLIFY = [
  'Rhode Island',
  'Maryland',
  'Massachusetts',
  'California',
  'Michigan',
  'Wisconsin'
];


var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.01;
var SIMPLIFY_MINIMUM_AREA_LOCAL = 0.001;

var SMALL_ISLAND_THRESHOLD_GLOBAL = 0.01;
var SMALL_ISLAND_THRESHOLD_LOCAL = 0.001;

function getFreshData(filename) {
  // Get the geojson data.
  var data = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));

  return data.features.map(function (feature) {
    return {
      'type': 'FeatureCollection',
      'features': [feature]
    };
  });
}

datasetsToModify.forEach(function (filename) {

  // Get the geojson data.
  var subDatasets = getFreshData(filename);

  var standardProjection = d3.geo.equirectangular();
  var simplifyOptions = {
    'coordinate-system': 'cartesian',
    'minimum-area': SIMPLIFY_MINIMUM_AREA_GLOBAL,
    'verbose': true
  };
  var options = {
    "property-transform": function (x) {
      return x.properties;
    }
  };

  var statesProvincesSubDatasets = subDatasets.filter(function (subDataset) {
    return subDataset.features[0].properties.admin === "United States of America"
      || subDataset.features[0].properties.admin === "Australia"
      || subDataset.features[0].properties.admin === "Brazil"
      || subDataset.features[0].properties.admin === "Canada";
  });

  statesProvincesSubDatasets = statesProvincesSubDatasets.map(function (subDataset) {

    if (DO_NOT_SIMPLIFY.indexOf(subDataset.features[0].properties.name) < 0) {
      removeSmallIslands(subDataset, d3.geo.path().projection(standardProjection), SMALL_ISLAND_THRESHOLD_GLOBAL);
    }

//    var topology = topojson.topology({collection: subDataset}, options);

    var retVal = subDataset.features[0].geometry;// topojson.merge(topology, topology.objects.collection.geometries);
    retVal.properties = subDataset.features[0].properties;
    if (subDataset.features[0].properties.name === 'Michigan') {
      console.log(subDataset.features[0]);
      console.log(retVal.properties);
      console.log(retVal);
    }  

    if (subDataset.features.length > 0) {
      if (DO_NOT_SIMPLIFY.indexOf(subDataset.features[0].properties.name) < 0) {
	var topology = topojson.topology({collection: subDataset}, options);

        console.log(topology.objects.collection.geometries[0].properties.name);
        topology = topojson.simplify(topology, simplifyOptions);
      
	retVal = topojson.merge(topology, topology.objects.collection.geometries);
        retVal.properties = topology.objects.collection.geometries[0].properties;
      }
    return retVal;
    }

  });


  var aggregateGeojson = {
    'type': 'FeatureCollection',
    'features': statesProvincesSubDatasets.map(function (subDataset) {
      var props = subDataset.properties;
      delete subDataset.properties;
      return {
        'type': 'Feature',
        'geometry': subDataset,
        'properties': props
      };
    })
  };

     fs.writeFile('aggregateGeojson.json', JSON.stringify(aggregateGeojson));

  var topojsonData = topojson.topology({collection: aggregateGeojson}, options);
  topojsonData.objects[filename.slice(0, filename.length - 5)] = topojsonData.objects.collection;
  topojsonData.objects.collection = null;

  fs.writeFile('topojsonDatasets/' + filename.slice(0, filename.length - 5) + '.json', JSON.stringify(topojsonData));
});

