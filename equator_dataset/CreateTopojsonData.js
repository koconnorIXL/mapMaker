var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');

// Get the geojson data.
var data = JSON.parse(fs.readFileSync('equator.json'));

// convert the geojson to topojson
var options = {
  "property-transform": function(x) { return x.properties; }
};
var topojsonData = topojson.topology({collection: data}, options);
topojsonData.objects.equator = topojsonData.objects.collection;
delete topojsonData.objects.collection;
fs.writeFile('topojsonDatasets/equator.json', JSON.stringify(topojsonData));

