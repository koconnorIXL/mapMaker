var fs = require('fs');
var countriesData = JSON.parse(fs.readFileSync('../geojsonDatasets/countries_high_res-tmp.json'));
var newProps = require('./SmallAreaProps.js');

for (var countryName in newProps) {
  if (newProps.hasOwnProperty(countryName)) {
    var newPropsEntry = newProps[countryName];

    var countryFeature;
    for (var i = 0; i < countriesData.features.length; i++) {
      var feature = countriesData.features[i];
      if (feature.properties.name === countryName || feature.properties.NAME === countryName) {
        countryFeature = feature;
      }
    }

    if (countryFeature) {
      for (var newPropKey in newPropsEntry) {
        if (newPropsEntry.hasOwnProperty(newPropKey)) {
          countryFeature.properties[newPropKey] = newPropsEntry[newPropKey];
        }
      }
    }
  }
}

fs.writeFileSync('countries_high_res-tmp.json', JSON.stringify(countriesData, null, '  '));

