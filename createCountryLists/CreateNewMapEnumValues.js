var fs = require('fs');
var sanitize = require('./sanitize.js');
var addEnumValueToFile = require('./add-enum-value-to-file.js');

var directory = '../topojsonDatasets/countries-tmp/countries_high_res_with_disputed';

function toEnumCase(s) {
  return sanitize(s.toUpperCase()).replace(/-/g, '_');
}

var out = fs.openSync('enumValues/countries_high_res_with_disputed.txt', 'w');

var infos = {};
var files = fs.readdirSync(directory);
files.forEach(function(filename) {
  var name = filename.substring(0, filename.length - 5);
  fs.writeSync(out, '  /** A dataset containing a high res versions of ' + filename.substring(0, filename.length - 28) + ' and surrounding claiming/claimed regions. */\n');
  fs.writeSync(out, '  ' + toEnumCase(name) + '("' + sanitize(name) + '"),\n');
});
