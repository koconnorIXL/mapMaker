var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./mapColoring/MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');
var ContinentColoring = require('./ContinentColoring.js');

var datasetsToModify = [
  'congressional_districts.json',
  'counties.json'
];


var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.02;
var SIMPLIFY_MINIMUM_AREA_LOCAL = 0.00001;

var SMALL_ISLAND_THRESHOLD_GLOBAL = 3;
var SMALL_ISLAND_THRESHOLD_LOCAL = 0;

datasetsToModify.forEach(function(filename) {

  // Get the geojson data.
  var data = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));
  
  // Prune some small islands out of the geojson data.
  //var standardProjection = d3.geo.equirectangular();
  //removeSmallIslands(data, d3.geo.path().projection(standardProjection), SMALL_ISLAND_THRESHOLD_LOCAL);

  // convert the geojson to topojson
  var options = {
    "property-transform": function(x) { return x.properties; }
  };
  var topojsonData = topojson.topology({collection: data}, options);
  topojsonData.objects[filename.slice(0, filename.length - 5)] = topojsonData.objects.collection;
  topojsonData.objects.collection = null;

  // smooth out some of the really detailed boundaries
  var simplifyOptions = {
    'coordinate-system': 'cartesian',
    'minimum-area': SIMPLIFY_MINIMUM_AREA_LOCAL 
  };
  //topojsonData = topojson.simplify(topojsonData, simplifyOptions);

  // resolve some disputed country boundaries in the countries dataset
  if (filename === 'countries.json') {
    topojsonData = ResolveBorders.mergeMoroccoWesternSahara(topojsonData);
  }

  // add a mapcolor5 field to the topojson
  var geometryCollection = topojsonData.objects[filename.slice(0, filename.length - 5)].geometries;

  var fiveColoring = MapColoring.fastFiveColoring(geometryCollection);
  if (filename === 'continents.json') {
    for (var i = 0; i < geometryCollection.length; i++) {
      var props = geometryCollection[i].properties;
      if (ContinentColoring[props.name]) {
        props.mapcolor5 = ContinentColoring[props.name];
      }
    }
  }
  else {
    for (var i = 0; i < geometryCollection.length; i++) {
      geometryCollection[i].properties.mapcolor5 = fiveColoring[i];
    }
  }

  fs.writeFile('topojsonDatasets/' + filename.slice(0, filename.length - 5) + '.json', JSON.stringify(topojsonData));
});

