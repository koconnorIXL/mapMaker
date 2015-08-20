var d3 = require('d3');

var data = [
  [[202.537, 253.143], [-75.917, 36.491]],
  [[205.928, 212.632], [-75.694, 38.460]],
  [[285.473, 121.889], [-70.817, 42.873]]
];

var slope = (data[0][0][0] - data[1][0][0]) / (data[0][1][0] - data[1][1][0]);
var yInt = data[0][0][0] - slope * data[0][1][0];

var predictedY = yInt + slope * data[2][1][0];
var actualY = data[2][0][0];

console.log(predictedY, actualY);

function fy(phi) { return Math.log(Math.tan(phi) + 1 / Math.cos(phi)); }

console.log(data.map(function(d) { return fy(d[1][1]) / d[0][1]; }))

console.log('albersusa');
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}
var albersProjection = d3.geo.albersUsa()
  .scale(1190)
  .translate([-130, 0]);
data.forEach(function(d) {
  console.log(d[0], albersProjection(d[1]));
});

var d01 = distance(data[0][0], data[1][0]);
var d12 = distance(data[1][0], data[2][0]);
var projD01 = distance(albersProjection(data[0][1]), albersProjection(data[1][1]));
var projD12 = distance(albersProjection(data[1][1]), albersProjection(data[2][1]));

console.log(d01, projD01);
console.log(d12, projD12);

console.log(d01 / projD01, d12 / projD12);
console.log(d01 / d12, projD01 / projD12);

