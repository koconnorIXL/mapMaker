var fs = require('fs');
var d3 = require('d3');
var findLongest = require('../FindLongestCoordinateArray.js');

var admin1 = JSON.parse(fs.readFileSync('../../geojsonDatasets/admin1_no_lakes_high_res.json'));
var countries = JSON.parse(fs.readFileSync('../../geojsonDatasets/countries_high_res.json'));

var states = admin1.features.filter(function(feature) {
  return feature.properties.admin === 'United States of America';
});

var usa = countries.features.filter(function(feature) { 
  return feature.properties.NAME === 'United States'; 
})[0];

// Clear all boundary data from the USA feature entry.
usa.geometry.coordinates = [];

// Add the states as claims of the USA
usa.properties.incoming_merges = usa.properties.incoming_merges || [];

states.forEach(function(feature) {
  if (feature.properties.name) {
    feature.properties.continent = 'North America';
    usa.properties.incoming_merges.push(feature.properties.name);
    feature.properties.merge_into = 'United States';
    countries.features.push(feature);
  }
});


var provinces = admin1.features.filter(function(feature) {
  return feature.properties.admin === 'Canada';
});

var canada = countries.features.filter(function(feature) {
  return feature.properties.NAME === 'Canada';
})[0];

canada.geometry.coordinates = [];
canada.properties.incoming_merges = [];

provinces.forEach(function(feature) {
  if (feature.properties.name) {
    feature.properties.continent = 'North America';
    canada.properties.incoming_merges.push(feature.properties.name);
    feature.properties.merge_into = 'Canada';
    countries.features.push(feature);
  }
});

fs.writeFileSync('countries_high_res.json', JSON.stringify(countries, null, '  '));

