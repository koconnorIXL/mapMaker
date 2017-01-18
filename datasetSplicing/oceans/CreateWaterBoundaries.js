var fs = require('fs');
var topojson = require('topojson');

var topology = JSON.parse(fs.readFileSync('./topojsonDatasets/oceans_high_res.json'));

var OCEANS = [
  'Atlantic_Ocean',
  'Pacific_Ocean',
  'Indian_Ocean',
  'Arctic_Ocean',
  'Southern_Ocean',
  'South_China_Sea',
  'Mediterranean_Sea',
  'Baltic_Sea'
];

function getOceanBoundaryFilter(ocean1, ocean2) {
  var oceans = [ocean1, ocean2];
  return function(a, b) {
    return a !== b && oceans.indexOf(a.properties.name) > -1 && oceans.indexOf(b.properties.name) > -1;
  };
}


for (var i = 0; i < OCEANS.length; i++) {
  for (var j = i + 1; j < OCEANS.length; j++) {
    var boundaries = topojson.mesh(topology, topology.objects.oceans, getOceanBoundaryFilter(OCEANS[i], OCEANS[j]));
    console.log(OCEANS[i], OCEANS[j]);
    console.log(boundaries.coordinates);
  }
}


