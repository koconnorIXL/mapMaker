var fs = require('fs');

var MapColoring = require('./MapColoring');
var createTopojson = require('../createTopojson/CreateTopojson.js');
var TopojsonOptions = require('../createTopojson/TopojsonOptions.js');
var SimplifyOptions = require('../createTopojson/SimplifyOptions.js');

var countries = JSON.parse(fs.readFileSync('../geojsonDatasets/countries_high_res.json'));
countries.features = countries.features.filter(function(feature) {
  return feature.properties.admin === 'United States of America';
});

var countriesTopology = createTopojson(
  countries,
  TopojsonOptions.standard(),
  SimplifyOptions.standardGlobal());

var coloringMap = MapColoring.createFiveColoringMap(countriesTopology.objects.collection.geometries);
fs.writeFileSync('states-five-coloring.json', JSON.stringify(coloringMap, null, '  '));
