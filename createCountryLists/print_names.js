
var fs = require('fs');

fs.readFile('geojsonDatasets/countries.json', function(err, data) {
  JSON.parse(data).features.forEach(function(feature) {
    console.log(feature.properties.name);
  });
});
