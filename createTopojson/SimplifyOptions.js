
var SIMPLIFY_MINIMUM_AREA_GLOBAL = 0.1;
var SIMPLIFY_MINIMUM_AREA_CARTESIAN_CONTINENTAL = 0.007;
var SIMPLIFY_MINIMUM_AREA_SPHERICAL_CONTINENTAL = 1e-6;
var SIMPLIFY_MINIMUM_AREA_LOCAL = 0.001;

var SMALL_ISLAND_THRESHOLD_GLOBAL = 3;
var SMALL_ISLAND_THRESHOLD_LOCAL = 0.0001;

module.exports = {
  standardGlobal: function() {
    return {
      "coordinate-system": "cartesian",
      "minimum-area": SIMPLIFY_MINIMUM_AREA_CARTESIAN_CONTINENTAL
    };
  },
  standardContinental: function() {
    return {
      "coordinate-system": "cartesian",
      "minimum-area": SIMPLIFY_MINIMUM_AREA_GLOBAL
    };
  }
};
  
