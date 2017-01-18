var fs = require('fs');

var splicePaths = require('./SplicePaths.js');
var findLongestCoordinateArray = require('./FindLongestCoordinateArray');

/**
 * Splice all the new territories into an older, existing dataset.
 */
function spliceAll(newTerritories, oldDataset, info) {
  var REVERSED = info.reversed;
  var ALREADY_SPLICED_MANUALLY = info.alreadySplicedManually;
  var HAS_FINALIZED_DATASET = info.hasFinalizedDataset;
  var PRECISION_MAP = info.precisionMap;

  newTerritories.forEach(function(name) {
    var id = name.replace(/ /g, '_');
  
    // It is nice to have all the boundary paths in the same orientation (clockwise). So if this
    // feature was saved in a counter-clockwise orientation, make sure to get a reversed version.
    var reversed = REVERSED.indexOf(id) > -1;
  
    // Get the file with this feature's geographic data
    var filename = './geojsonDatasets/' + id + '.json';
    if (HAS_FINALIZED_DATASET.indexOf(id) > -1) {
      filename = './geojsonDatasets/' + id + '_final.json';
    }
    var territoryFeature = JSON.parse(fs.readFileSync(filename)).features[0];
  
    var featureInDatasetAlready = oldDataset.features.some(function(feature) {
      var featureName = feature.properties.name || feature.properties.NAME;
      return featureName === id || featureName === name;
    });
    if (featureInDatasetAlready) {
      return;
    }
    
    // Get the feature which the new feature is claimed by.
    var claimers = territoryFeature.properties.claimed_by;
    var claimer = claimers[0];
    var claimingFeatures = oldDataset.features.filter(function(feature) {
      return claimers.indexOf(feature.properties.NAME || feature.properties.name) > -1;
    });
    var claimingFeature = claimingFeatures.filter(function(feature) {
      return feature.properties.NAME === claimer || feature.properties.name === claimer;
    })[0];
    
    // Add the new feature to the 'external_claims' entry for the claiming
    // country, if not already present.
    claimingFeatures.forEach(function(feature) {
      if (!feature.properties.external_claims) {
        feature.properties.external_claims = [];
      }
      if (feature.properties.external_claims.indexOf(id) === -1) {
        feature.properties.external_claims.push(id);
      }
    });
    
    var claimerIndex = oldDataset.features.indexOf(claimingFeature);
    
    if (ALREADY_SPLICED_MANUALLY.indexOf(id) === -1) {
      console.log('splicing');
      var longestPathInfo = findLongestCoordinateArray(claimingFeature);
      var claimingPs = longestPathInfo.coordinates.slice();
      if (territoryFeature.geometry.type === 'MultiPolygon') {
        for (var i = 0; i < territoryFeature.geometry.coordinates.length; i++) {
          var territoryPs = territoryFeature.geometry.coordinates[i][0];
          if (reversed || (id === 'Bhutan_China_border' && (i === 0 || i === 3))) {
            territoryPs = territoryPs.reverse();
          }
          var newPaths = splicePaths(territoryPs, claimingPs, PRECISION_MAP[id]);
          claimingPs = newPaths[1];
          territoryFeature.geometry.coordinates[i] = [newPaths[0]];
        }
      }
      else {
        var territoryPs = territoryFeature.geometry.coordinates[0];
        if (reversed) {
          territoryPs = territoryPs.reverse();
        }
        var newPaths = splicePaths(territoryPs, claimingPs, PRECISION_MAP[id]);
        territoryFeature.geometry.coordinates = [newPaths[0]];
        claimingPs = newPaths[1];
      }
      if (claimingFeature.geometry.type === 'MultiPolygon') {
        var polygonIndex = longestPathInfo.polygonIndex;
        claimingFeature.geometry.coordinates[polygonIndex][longestPathInfo.index] = claimingPs;
      }
      else {
        claimingFeature.geometry.coordinates[longestPathInfo.index] = claimingPs;
      }
    }
  
    oldDataset.features.splice(claimerIndex, 0, territoryFeature);
  });
}

module.exports = spliceAll;
