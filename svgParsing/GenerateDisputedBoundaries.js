var fs = require('fs');
var topojson = require('topojson');

var DISPUTED_BOUNDARY_PAIRS = [
  ['Ethiopia', 'Somalia'],
  ['Serbia', 'Croatia'],
  ['Chile', 'Argentina'],
  ['Spain', 'Portugal'],
];

var high_res_options = {
  "property-transform": function(x) { return x.properties; },
};

var data = JSON.parse(fs.readFileSync('../geojsonDatasets/countries_high_res.json'));
var topology = topojson.topology({ collection: data }, high_res_options);


DISPUTED_BOUNDARY_PAIRS.forEach(function(pair) {
  var meshFilter = function(a, b) {
    var nameA = a.properties.NAME;
    var nameB = b.properties.NAME;
    return a !== b && pair.indexOf(nameA) > -1 && pair.indexOf(nameB) > -1;
  };

  console.log(pair);

  var multiLineStringFeature = topojson.mesh(topology, topology.objects.collection, meshFilter);
  var properties = {
    boundary_pair: pair
  };
  multiLineStringFeature.properties = properties;
  fs.writeFileSync('geojsonDatasets/' + pair[0] + '_' + pair[1] + '_boundary.json', JSON.stringify(multiLineStringFeature, null, '  '));
});

