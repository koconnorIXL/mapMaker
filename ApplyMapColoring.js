var fs = require('fs');
var topojson = require('topojson');
var MapColoring = require('./MapColoring.js');

var filename = 'admin1.json';
 
// Get the geojson data.
var data = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));


// convert the geojson to topojson
var options = {
  "property-transform": function(x) { return x.properties; }
};
var topojsonData = topojson.topology({collection: data}, options);
topojsonData.objects[filename.slice(0, filename.length - 5)] = topojsonData.objects.collection;
topojsonData.objects.collection = null;


// add a mapcolor5 field to the topojson
var geometryCollection = topojsonData.objects[filename.slice(0, filename.length - 5)].geometries;

var fiveColoring = MapColoring.fastFiveColoring(geometryCollection);

var freshData = JSON.parse(fs.readFileSync('geojsonDatasets/' + filename));

for (var i = 0; i < geometryCollection.length; i++) {
  freshData.features[i].properties.mapcolor5 = fiveColoring[i];
}


fs.writeFile('geojsonDatasets/' + filename, JSON.stringify(freshData, null, 2));

