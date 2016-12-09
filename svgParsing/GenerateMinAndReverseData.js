var fs = require('fs');

var NAMES = [
  'Korean_Demilitarized_Zone',
  'Nagorno-Karabakh'
];

NAMES.forEach(function(name) {
  var filenameBase = 'geojsonDatasets/' + name;
  var data = JSON.parse(fs.readFileSync(filenameBase + '.json'));
  fs.writeFileSync(filenameBase + '_min.json', JSON.stringify(data, null, ''));
  
  data.features[0].geometry.coordinates[0] = data.features[0].geometry.coordinates[0].reverse();
  fs.writeFileSync(filenameBase + '_reversed.json', JSON.stringify(data, null, '  '));
  fs.writeFileSync(filenameBase + '_reversed_min.json', JSON.stringify(data, null, ''));
});
  
