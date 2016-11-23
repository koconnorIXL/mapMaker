var fs = require('fs');

var splicePaths = require('./SplicePaths.js');
var findLongestCoordinateArray = require('./FindLongestCoordinateArray');

var propMap = require('./NewTerritoryPropMap.js');
var countries = JSON.parse(fs.readFileSync('../geojsonDatasets/countries_high_res.json'));

var REVERSED = [
  'South_Ossetia',
  'Bir_Tawil',
  'Kashmir'
];

var PRECISION_MAP = {};

var FRENCH_GUIANA_POLYGON_INDEX = 3;

for (var id in propMap) {
  if (propMap.hasOwnProperty(id)) {
    if (id === 'Korean_Demilitarized_Zone' || id === 'Nagorno_Karabakh') {
      continue;
    }
    console.log(id);

    // It is nice to have all the boundary paths in the same orientation (clockwise). So if this
    // feature was saved in a counter-clockwise orientation, make sure to get a reversed version.
    var reversed = REVERSED.indexOf(id) > -1;

    // Get the file with this feature's geographic data
    var filename = './geojsonDatasets/' + id + '.json';
    var territoryFeature = JSON.parse(fs.readFileSync(filename)).features[0];
    
    // Get the feature which the new feature is claimed by.
    var claimer = territoryFeature.properties.claimed_by[0];
    var claimingFeature = countries.features.filter(function(feature) {
      return feature.properties.NAME === claimer;
    })[0];
    
    // Add the new feature to the 'external_claims' entry for the claiming
    // country, if not already present.
    if (!claimingFeature.properties.external_claims) {
      claimingFeature.properties.external_claims = [];
    }
    if (claimingFeature.properties.external_claims.indexOf(id) === -1) {
      claimingFeature.properties.external_claims.push(id);
    }
    
    var claimerIndex = countries.features.indexOf(claimingFeature);
    var longestPathInfo = findLongestCoordinateArray(claimingFeature);
    var claimingPs = longestPathInfo.coordinates.slice();
    if (id === 'Lawa_Headwaters') {
      claimingPs = claimingFeature.geometry.coordinates[FRENCH_GUIANA_POLYGON_INDEX][0];
    }
 
    if (territoryFeature.geometry.type === 'MultiPolygon') {
      for (var i = 0; i < territoryFeature.geometry.coordinates.length; i++) {
        var territoryPs = territoryFeature.geometry.coordinates[i][0];
        if (reversed || (id === 'Bhutan_China_border' && (i === 0 || i === 2))) {
          territoryPs = territoryPs.reverse();
        }
        var newPaths = splicePaths(territoryPs, claimingPs, PRECISION_MAP[id]);
        claimingPs = newPaths[1];
        territoryFeature.geometry.coordinates[i] = [newPaths[1]];
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
      if (id === 'Lawa_Headwaters') {
        polygonIndex = FRENCH_GUIANA_POLYGON_INDEX;
      }
      claimingFeature.geometry.coordinates[polygonIndex][longestPathInfo.index] = claimingPs;
    }
    else {
      claimingFeature.geometry.coordinates[longestPathInfo.index] = claimingPs;
    }

    countries.features.splice(claimerIndex, 0, territoryFeature);
  }
}


//var abkhaziaFeature = abkhazia.features[0];
//var abkhaziaPs = abkhaziaFeature.geometry.coordinates[0];
//var georgiaFeature = countries.features.filter(function(feature) { return feature.properties.NAME === 'Georgia'; })[0];
//var georgiaIndex = countries.features.indexOf(georgiaFeature);
//var georgiaPs = georgiaFeature.geometry.coordinates[1];
//
//
//var newPaths = splicePaths(abkhaziaPs, georgiaPs);
//abkhaziaFeature.geometry.coordinates = [newPaths[0]];
//georgiaFeature.geometry.coordinates = [newPaths[1]];
//
//// splice in abkhazia to the countries dataset
//countries.features.splice(georgiaIndex, 0, abkhaziaFeature);

console.log('writing file: countries_high_res-tmp.json');
fs.writeFileSync('countries_high_res-tmp.json', JSON.stringify(countries, null, '  '));
