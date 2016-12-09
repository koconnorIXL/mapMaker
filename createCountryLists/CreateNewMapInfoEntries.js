var fs = require('fs');
var sanitize = require('./sanitize.js');

var directory = '../topojsonDatasets/countries-tmp/countries_high_res_with_disputed';

var infos = {};
var files = fs.readdirSync(directory);
files.forEach(function(filename) {
  var name = filename.substring(0, filename.length - 5);
  infos[sanitize(name)] = {
    mediaVersion: 0,
    filename: 'countries/high_res_with_disputed/' + filename,
    collectiveName: 'countries',
    individualName: 'country',
    defaultColors: [],
    subOptions: []
  };
});

fs.writeFileSync('mapInfos/countries_high_res_with_disputed.json', JSON.stringify(infos, null, '  '));
