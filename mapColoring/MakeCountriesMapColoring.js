var fs = require('fs');

var MapColoring = require('./MapColoring');
var createTopojson = require('../createTopojson/CreateTopojson.js');
var TopojsonOptions = require('../createTopojson/TopojsonOptions.js');
var SimplifyOptions = require('../createTopojson/SimplifyOptions.js');

var countries = JSON.parse(fs.readFileSync('../geojsonDatasets/countries_high_res.json'));
var countriesTopology = createTopojson(
  countries,
  TopojsonOptions.standard(),
  SimplifyOptions.standardGlobal());

var coloringMap = MapColoring.createFiveColoringMap(countriesTopology.objects.collection.geometries);
fs.writeFileSync('countries-five-coloring.json', JSON.stringify(coloringMap, null, '  '));
