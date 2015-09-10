var getProjection = require('./ProjectionUtils.js').getProjection;

var BIG = 100000000;
var NUM_ITERATIONS = 3;

exports.getProjectionToBound = function(projectionOptions, feature, width, height, marginMultiplier) {
  projectionOptions.clipExtent = [[-BIG, -BIG], [BIG, BIG]];

  var projection = getProjection(projectionOptions);

  var path = d3.geo.path();
  path.projection(projection);

  var bounds;
  var dx;
  var dy;
  var newCenter;
  var zoomScale;
  for (var i = 0; i < NUM_ITERATIONS; i++) {
    bounds = path.bounds(feature);
    dx = bounds[1][0] - bounds[0][0];
    dy = bounds[1][1] - bounds[0][1];
    var w = dx * marginMultiplier;
    var h = dy * marginMultiplier;
    newCenter = projection.invert([
      (bounds[0][0] + bounds[1][0]) / 2, 
      (bounds[0][1] + bounds[1][1]) / 2
    ]);

    newCenter[0] = Math.round(10 * newCenter[0]) / 10;
    newCenter[1] = Math.round(10 * newCenter[1]) / 10;
   
    var zoomScale = BIG;
    if (width) {
      zoomScale = width / w;
    }
    if (height) {
      zoomScale = Math.min(zoomScale, height / h);
    }
    if (!width && !height) {
      zoomScale = 1;
    }

    projection.center(newCenter);
    projection.scale(projection.scale() * zoomScale);
    path.projection(projection);
  }
  
  bounds = path.bounds(feature);
  dx = bounds[1][0] - bounds[0][0];
  dy = bounds[1][1] - bounds[0][1];

  var scaleRatio = projection.scale() / Math.max(dx, dy) / marginMultiplier;
  scaleRatio = Math.round(scaleRatio * 10) / 10;
  projection.scale(scaleRatio * Math.max(dx, dy) * marginMultiplier);

  projection.clipExtent([[0, 0], [dx * marginMultiplier, dy * marginMultiplier]]);

  return projection;
};
