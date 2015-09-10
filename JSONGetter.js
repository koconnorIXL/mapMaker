var d3 = require('d3');

var cache = {};

exports.getTopojson = function(filename, cb) {
  if (!cache[filename]) {
    d3.json('topojsonDatasets/' + filename, function(err, parsedJSON) {
      if (err) { console.log(err); }
      cache[filename] = parsedJSON;
      cb(parsedJSON);
    });
  }
  else {
    cb(cache[filename]);
  }
}

