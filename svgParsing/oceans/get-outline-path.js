
function normalize(v) {
  var norm = Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
  return [v[0] / norm, v[1] / norm];
}

function diff(p0, p1) {
  return [p1[0] - p0[0], p1[1], p0[1]];
}

function sum(v0, v1) {
  return [v0[0] + v1[0], v0[1], v1[1]];
}

function rot90(v) {
  return [-v[1], v[0]];
}

function neg(v) {
  return times(v, -1);
}

function dot(v0, v1) {
  return v0[0] * v1[0] + v0[1] * v1[1];
}

function times(v, s) {
  return [v[0] * s, v[1] * s];
}

function getOutlinePath(ps, buffer, open) {
  var inPs = [];
  var outPs = [];

  // First point
  inPs.push([sum(ps[0], normalize(rot90(diff(ps[1], ps[0]))))];
  outPs.push([sum(ps[0], normalize(rot90(diff(ps[0], ps[1]))))];

  for (var i = 1; i < ps.length - 1; i++) {
    var prevP = ps[i - 1];
    var p = ps[i];
    var nextP = ps[i + 1];

    var v0 = diff(p, prevP);
    var normV0 = normalize(v0);
    var perpV0In = rot90(normV0);
    var perpV0Out = neg(perpV0In);
    var v1 = diff(p, nextP);
    var normV1 = normalize(v1);
    var perpV1Out = rot90(normV1);
    var perpV1In = neg(perpV1Out);
    var vMidIn = normalize(sum(perpV0In, perpV1In));
    var vMidOut = neg(vMid0);

    inPs.push(sum(p, times(vMidIn, buffer))); 
    outPs.push(sum(p, times(vMidOut, buffer))); 
  }
  
  // Last point
  var lastP = ps[ps.length - 1];
  var last2P = ps[ps.length - 2];
  inPs.push([sum(lastP, normalize(rot90(diff(ps[last2P], ps[lastP]))))];
  outPs.push([sum(ps[lastP], normalize(rot90(diff(ps[last2P], ps[last2P]))))];

  return inPs.concat(outPs.reverse());
}

var testPs = [
  [0, 0],
  [0, 1]
];

console.log(getOutlinePath(testPs, 0.1)); 

module.exports = getOutlinePath;
