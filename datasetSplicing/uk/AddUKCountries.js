var fs = require('fs');
var d3 = require('d3');
var findLongest = require('../FindLongestCoordinateArray.js');

var subunits = JSON.parse(fs.readFileSync('../../geojsonDatasets/admin0_subunits.json'));

var england = subunits.features.filter(function(feature) { return feature.properties.NAME === 'England'; })[0];
var wales = subunits.features.filter(function(feature) { return feature.properties.NAME === 'Wales'; })[0];
var scotland = subunits.features.filter(function(feature) { return feature.properties.NAME === 'Scotland'; })[0];
var northernIreland = subunits.features.filter(function(feature) { return feature.properties.NAME === 'N. Ireland'; })[0];

var countries = JSON.parse(fs.readFileSync('../../geojsonDatasets/countries_high_res.json'));
var uk = countries.features.filter(function(feature) { 
  return feature.properties.NAME === 'United Kingdom'; 
})[0];

// Clear all boundary data from the UK feature entry.
uk.geometry.coordinates = [];

// Add the UK countries as claims of the UK
uk.properties.incoming_merges = ['England', 'Wales', 'Scotland', 'N. Ireland'];

england.properties.merge_into = 'United Kingdom';
wales.properties.merge_into = 'United Kingdom';
scotland.properties.merge_into = 'United Kingdom';
northernIreland.properties.merge_into = 'United Kingdom';

// Add the UK countries as individual features in the dataset.
countries.features.push(england);
countries.features.push(wales);
countries.features.push(scotland);
countries.features.push(northernIreland);

fs.writeFileSync('countries_high_res.json', JSON.stringify(countries, null, '  '));

