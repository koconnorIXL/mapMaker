var fs = require('fs');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');

var datasetsToModify = [
  'countries.json',
  'admin1.json'
];

datasetsToModify.forEach(function(filename) {
  var data = JSON.parse(fs.readFileSync('topojsonDatasets/' + filename));
  var geometryCollection = data.objects[filename.slice(0, filename.length - 5)].geometries;
  var fiveColoring = MapColoring.fastFiveColoring(geometryCollection);

  for (var i = 0; i < geometryCollection.length; i++) {
    geometryCollection[i].properties.mapcolor5 = fiveColoring[i];
  }

  fs.writeFile('topojsonDatasets/' + filename.slice(0, filename.length - 5) + '2.json', JSON.stringify(data));
});
