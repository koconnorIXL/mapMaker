var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');

var options = {
  "property-transform": function(x) { for (var propName in x.properties) {
      var lowered = propName.toLowerCase();
      if (lowered !== propName) {
        x.properties[lowered] = x.properties[propName];
        delete x.properties[propName];
      }
    }
    return x.properties; 
  }
};

// Get the geojson data.
var data = JSON.parse(fs.readFileSync('geojsonDatasets/russia_boundary.json'));

// Convert this data to topojson
var topology = topojson.topology({collection: data}, options);
topology.objects.countries = topology.objects.collection;
delete topology.objects.collection;

fs.writeFileSync('topojsonDatasets/russia_boundary.json', JSON.stringify(topology));
