var fs = require('fs');
var topojson = require('topojson');

var filename = 'cities.json';
var name = filename.slice(0, filename.length - 5);

// The minimum city population for a city to be automatically kept in the dataset.
var populationThreshold = 100000;

// Returns true if the city with the given feature should be kept in the dataset.
// We keep cities that are country or region capitals, as well as any other cities that
// have populations above the populationThreshold.
var shouldKeep = function(feature) {
  return (feature.properties.feature_code === 'PPLA' ||
    feature.properties.feature_code === 'PPLC' ||
    feature.properties.population >= populationThreshold);
}

// Get the topojson data.
var data = JSON.parse(fs.readFileSync('topojsonDatasetsRaw/' + filename));

// Remove cities that are not big/important enough to keep in the dataset.
data.objects[name].geometries = data.objects[name].geometries.filter(shouldKeep);

// Save to file.
fs.writeFile('topojsonDatasets/' + filename, JSON.stringify(data));

