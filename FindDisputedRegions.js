var topojson = require('topojson');
var getGeometryFromTopology = require('./GetGeometryFromTopology.js');

/**
 * Consider the following equivalence relation between features on a map:
 *   a ~~ b ==> a and b are related by a disputed claim, or will be merged together
 *
 * Using this relation, we can decompose the features of this dataset into
 * equivalence classes. Note that two features will be a member of the same
 * equivalence class roughly iff you can travel from one featutre to the other without
 * ever crossing a solid line on the map (except perhaps a water boundary
 * between two parts of the same country).
 *
 * This method computes the equivalence class which contains the inputted feature.
 */
module.exports = function findDisputedRegions(topology) {
  var components = [];
  var featureMap = {};

  var geometries = getGeometryFromTopology(topology).geometries;

  geometries.forEach(function(geometry, index) {
    var props = geometry.properties;
    var name = props.name;
    featureMap[name] = {
      index: index,
      properties: props
    };
  });

  function search(name, connectedComponent) {
    var o = featureMap[name];
    if (o.visited) {
      return;
    }

    connectedComponent[name] = true;
    o.visited = true;

    var disputedNeighbors = (o.properties.incoming_merges || [])
      .concat(o.properties.disputed_border_with || [])
      .concat(o.properties.external_claims || [])
      .concat(o.properties.quasi_external_claims || [])
      .concat(o.properties.claimed_by || [])
      .concat(o.properties.quasi_claimed_by || []);
    if (o.properties.merge_into) {
      disputedNeighbors.push(o.properties.merge_into);
    }

    disputedNeighbors.forEach(function(neighborName) { search(neighborName, connectedComponent); });
  }

  Object.keys(featureMap).forEach(function(name) {
    if (!featureMap[name].visited) {
      var newComponent = {};
      search(name, newComponent);
      if (Object.keys(newComponent).length > 1) {
        components.push(newComponent);
      }
    }
  });

  return components;
};
