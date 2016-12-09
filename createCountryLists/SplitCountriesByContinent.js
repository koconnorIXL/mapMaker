
var fs = require('fs');
var countriesData = JSON.parse(fs.readFileSync('../geojsonDatasets/countries_high_res-tmp.json'));

var CONTINENTS = {
  'North America': [],
  'South America': [],
  'Africa': [],
  'Europe': [],
  'Asia': [],
  'Oceania': [],
  'Antarctica': [],
  'Seven seas (open ocean)': []
};

countriesData.features.forEach(function(feature) {
  var list = CONTINENTS[feature.properties.continent || feature.properties.CONTINENT];
  if (list) {
    list.push(feature.properties.name || feature.properties.NAME);
  }
});

fs.writeFileSync('countries-by-continent.txt', JSON.stringify(CONTINENTS, null, '  '));
