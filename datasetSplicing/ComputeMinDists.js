
function d(p1, p2) {
  var dx = p1[0] - p2[0];
  var dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function computeMinDists(ps1, ps2) {
  var minDists1 = [];
  var minDists2 = [];
  var minDist;
  var i, j;
  for (i = 0; i < ps1.length; i++) {
    minDist = 1e6;
    for (j = 0; j < ps2.length; j++) {
      minDist = Math.min(minDist, d(ps1[i], ps2[j]));
    }
    minDists1.push(minDist);
  }

  for (j = 0; j < ps2.length; j++) {
    minDist = 1e6;
    for (i = 0; i < ps1.length; i++) {
      minDist = Math.min(minDist, d(ps1[i], ps2[j]));
    }
    minDists2.push(minDist);
  }

  return [minDists1, minDists2];
}

module.exports = computeMinDists;
