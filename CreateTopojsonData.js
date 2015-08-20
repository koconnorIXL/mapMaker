var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');
var removeSmallIslands = require('./RemoveSmallIslands.js').removeSmallIslands;
var ResolveBorders = require('./FixDisputedBoundaries.js');

var datasetsToModify = [
  'countries.json',
  'admin1.json',
  'usa.json',
  'disputed_boundaries.json'
];

datasetsToModify.forEach(function(filename) {

  // Get the geojson data.
  var data = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));
  
  // Prune some small islands out of the geojson data.
  var standardProjection = d3.geo.equirectangular();
  removeSmallIslands(data, d3.geo.path().projection(standardProjection), 3);

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
    'minimum-area': 0.02
  };
  topojsonData = topojson.simplify(topojsonData, simplifyOptions);

  // resolve some disputed country boundaries in the countries dataset
  if (filename === 'countries.json') {
    topojsonData = ResolveBorders.mergeMoroccoWesternSahara(topojsonData);
  }

  // add a mapcolor5 field to the topojson
  var geometryCollection = topojsonData.objects[filename.slice(0, filename.length - 5)].geometries;

  var fiveColoring = MapColoring.fastFiveColoring(geometryCollection);

  for (var i = 0; i < geometryCollection.length; i++) {
    geometryCollection[i].properties.mapcolor5 = fiveColoring[i];
  }

  fs.writeFile('topojsonDatasets/' + filename.slice(0, filename.length - 5) + '.json', JSON.stringify(topojsonData));
});
