var fs = require('fs');
var spliceAll = require('./SpliceAllDatasets.js');

var newTerritories = require('./NewTerritories.js');

var OLD_DATASET_FILE = '../geojsonDatasets/countries_high_res.json';
var oldDataset = JSON.parse(fs.readFileSync(OLD_DATASET_FILE));

var REVERSED = [
  'South_Ossetia',
  'Bir_Tawil',
  'Kashmir',
  'Transnistria'
];

var ALREADY_SPLICED_MANUALLY = [
  'Korean_Demilitarized_Zone',
  'Nagorno-Karabakh',
  'Mayotte'
];

var HAS_FINALIZED_DATASET = [
  'Kashmir'
];

var PRECISION_MAP = {
  'Bhutan_China_border': 0.025
};

spliceAll(
  newTerritories,
  oldDataset,
  {
    reversed: REVERSED,
    alreadySplicedManually: ALREADY_SPLICED_MANUALLY,
    hasFinalizedDataset: HAS_FINALIZED_DATASET,
    precisionMap: PRECISION_MAP
  }
);

console.log('writing file: countries_high_res-tmp.json');
fs.writeFileSync('countries_high_res-tmp.json', JSON.stringify(oldDataset, null, '  '));
