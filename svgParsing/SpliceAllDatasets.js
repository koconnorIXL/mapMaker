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

for (var id in propMap) {
  if (propMap.hasOwnProperty(id)) {
    if (id === 'Korean_Demilitarized_Zone') {
      continue;
    }

    var suffix = '';
    if (REVERSED.indexOf(id) > -1) {
      suffix = '-reversed';
    }
    var filename = './geojsonDatasets/' + id + suffix + '.json';
    var territoryFeature = JSON.parse(fs.readFileSync(filename)).features[0];
    var territoryPs = territoryFeature.geometry.coordinates[0];
    var claimer = territoryFeature.properties.claimed_by[0];
    var claimingFeature = countries.features.filter(function(feature) {
      return feature.properties.NAME === claimer;
    })[0];
    var claimerIndex = countries.features.indexOf(claimingFeature);
    var longestPathInfo = findLongestCoordinateArray(claimingFeature);
    var claimingPs = longestPathInfo.coordinates.slice();

    var newPaths = splicePaths(territoryPs, claimingPs);

    territoryFeature.geometry.coordinates = [newPaths[0]];
    if (claimingFeature.geometry.type === 'MultiPolygon') {
      claimingFeature.geometry.coordinates[longestPathInfo.polygonIndex][longestPathInfo.index] = newPaths[1];
    }
    else {
      claimingFeature.geometry.coordinates[longestPathInfo.index] = newPaths[1];
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
