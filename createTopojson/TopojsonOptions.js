
module.exports = {
  standard: function() {
    return {
      "property-transform": function(feature) {
        for (var propName in feature.properties) {
          var lowered = propName.toLowerCase();
          if (lowered !== propName) {
            feature.properties[lowered] = feature.properties[propName];
            delete feature.properties[propName];
          }
        }
        return feature.properties;
      }
    };
  },
  highRes: function() {
    return {
      "property-transform": function(feature) {
        for (var propName in feature.properties) {
          var lowered = propName.toLowerCase();
          if (lowered !== propName) {
            feature.properties[lowered] = feature.properties[propName];
            delete feature.properties[propName];
          }
        }
        return feature.properties;
      },
      "quantization": 0
    };
  }
};
