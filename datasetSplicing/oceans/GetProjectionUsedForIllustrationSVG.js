var d3 = require('d3');
var w = 746;
var h = 371; 
var projectionSettings = {
  scale: 115.63,
  center: [0, 0],
  rotate: [0, 0, 0],
  translate: [w / 2, h / 2]
};
module.exports = function() {
  return  d3Projection = d3.geo.mercator()
    .scale(projectionSettings.scale)
    .center(projectionSettings.center)
    .rotate(projectionSettings.rotate)
    .translate(projectionSettings.translate)
    .clipExtent([[0, 0], [w, h]])
    .precision(0);
};