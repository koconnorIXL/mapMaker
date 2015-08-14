var topojson = require('topojson');

function merge(topology, datasetName, name1, name2) {
  var data = topology.objects[datasetName].geometries;
  var index1 = -1;
  var index2 = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i].properties.name_long === name1) {
      index1 = i;
    }
    if (data[i].properties.name_long === name2) {
      index2 = i;
    }
  }
  var merged = topojson.mergeArcs(
    topology,
    [ data[index1], data[index2] ]);
  merged.properties = data[index1].properties;
  data.splice(index1, 1, merged);
  data.splice(index2, 1);
  return topology;
}

exports.mergeMoroccoWesternSahara = function mergeMoroccoWesternSahara(countriesTopojson) {
  return merge(countriesTopojson, 'countries', 'Morocco', 'Western Sahara');
}

