var fs = require('fs');

var allCountries = JSON.parse(fs.readFileSync('countries_high_res.json'));

allCountries.features.forEach(function(feature) {
  var name = feature.properties.name || feature.properties.NAME;
  if (feature.properties.admin === 'United States of America') {
    fs.writeFileSync('geojson/' + name + '.json', JSON.stringify(feature, null, '  '));
    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates[0] = feature.geometry.coordinates[0].reverse();
    }
    else {
      feature.geometry.coordinates.forEach(function(cs) {
        cs[0] = cs[0].reverse();
      });
    }
    fs.writeFileSync('geojson/' + name + '_reversed.json', JSON.stringify(feature, null, '  '));
  }
});
