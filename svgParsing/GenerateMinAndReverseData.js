var fs = require('fs');

var data = JSON.parse(fs.readFileSync('geojsonDatasets/Korean_Demilitarized_Zone.json'));
fs.writeFileSync('geojsonDatasets/Korean_Demilitarized_Zone_min.json', JSON.stringify(data, null, ''));

data.features[0].geometry.coordinates[0] = data.features[0].geometry.coordinates[0].reverse();
fs.writeFileSync('geojsonDatasets/Korean_Demilitarized_Zone_reversed.json', JSON.stringify(data, null, '  '));
fs.writeFileSync('geojsonDatasets/Korean_Demilitarized_Zone_reversed_min.json', JSON.stringify(data, null, ''));

