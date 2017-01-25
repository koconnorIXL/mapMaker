var fs = require('fs');
var topojson = require('topojson');
var countries = JSON.parse(fs.readFileSync('../../geojsonDatasets/countries_high_res.json'));
var east_russia = JSON.parse(fs.readFileSync('geojsonDatasets/EastRussia.json')).features[0];
var west_russia = JSON.parse(fs.readFileSync('geojsonDatasets/WestRussia.json')).features[0];

countries.features.forEach(function(feature, index) {
  var name = feature.properties.name || feature.properties.NAME;
  if (name === 'Russia') {
    feature.geometry.coordinates = [];
    feature.properties.incoming_merges = ['European Russia', 'Asian Russia'];
  }
});

east_russia.properties.merge_into = 'Russia';
west_russia.properties.merge_into = 'Russia';

countries.features.push(east_russia);
countries.features.push(west_russia);

fs.writeFileSync('countries_high_res.json', JSON.stringify(countries, null, '  '));

