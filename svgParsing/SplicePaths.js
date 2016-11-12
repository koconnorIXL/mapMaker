var createGeojsonObject = require('./CreateGeojsonObject.js');


var MIN_STREAK = 1;
var CLOSE_THRESHOLD = 0.05;

function all(predicate, args) {
  return args.filter(predicate).length === args.length;
}

function nextN(start, n, arr) {
  var res = [];
  for (var i = 0; i < n; i++) {
    res.push(arr[(i + start) % arr.length]);
  }
  return res;
}

function lessThanThreshold(x) {
  return x < CLOSE_THRESHOLD;
}

function greaterThanThreshold(x) {
  return x >= CLOSE_THRESHOLD;
}

var computeMinDists = require('./ComputeMinDists.js');

function splicePaths(newData, existingData) {
  var ps1 = newData;
  var ps2 = existingData;

  var minDists = computeMinDists(ps1, ps2);
  var minDists1 = minDists[0];
  var minDists2 = minDists[1];

  var overlap = [];
  var splitter = [];

  var startLooking = false;
  var startAdding = false;
  var i, j;
  for (j = 0; j < 2 * ps2.length; j++) {
    if (all(greaterThanThreshold, nextN(j % ps2.length, MIN_STREAK, minDists2))) {
      startLooking = true;
    }
    if (startLooking) {
      if (all(lessThanThreshold, nextN(j % ps2.length, MIN_STREAK, minDists2))) {
        startAdding = true;
      }
      if (startAdding) {
        overlap.push(ps2[j % ps2.length]);
        if (all(greaterThanThreshold, nextN((j + 1) % ps2.length, MIN_STREAK, minDists2))) {
          break;
        }
      }
    }
  }

  startLooking = false;
  startAdding = false;
  for (i = 0; i < ps1.length; i++) {
    if (all(lessThanThreshold, nextN(i % ps1.length, MIN_STREAK, minDists1))) {
      startLooking = true;
    }

    if (startLooking) {
      if (!startAdding && all(greaterThanThreshold, nextN(i % ps1.length, MIN_STREAK, minDists1))) {
        startAdding = true;
        splitter.push(ps1[(i + ps1.length - 1) % ps1.length]);
        splitter.push(ps1[i % ps1.length]);
      }
      else if (startAdding) {
        splitter.push(ps1[i % ps1.length]);
        if (all(lessThanThreshold, nextN(i % ps1.length, MIN_STREAK, minDists1))) {
          break;
        }
      }
    }
  }
  //console.log(ps1);
  //console.log(ps2);
  //console.log(minDists1);
  //console.log(minDists2);
  //console.log(splitter);
  //console.log(overlap);
  
  var finalNewPath = overlap.concat(splitter.slice(1));
  var firstNewP = finalNewPath[0];
  var lastNewP = finalNewPath[finalNewPath.length - 1];
  if (firstNewP[0] !== lastNewP[0] || firstNewP[1] !== lastNewP[1]) {
    finalNewPath.push(firstNewP.slice());
  }
  var modifiedOldPath = splitter.slice().reverse();
  var indexOfIntersect1 = ps2.indexOf(overlap[0]);
  var indexOfIntersect2 = indexOfIntersect1 + overlap.length;
  for (i = 0; i <= ps2.length - overlap.length; i++) {
    modifiedOldPath.push(ps2[(indexOfIntersect2 + i) % ps2.length]);
  }
  var firstOldP = modifiedOldPath[0];
  var lastOldP = modifiedOldPath[modifiedOldPath.length - 1];
  if (firstOldP[0] !== lastOldP[0] || firstOldP[1] !== lastOldP[1]) {
    modifiedOldPath.push(firstOldP.slice());
  }

  //console.log(finalNewPath);
  //console.log(modifiedOldPath);
  return [finalNewPath, modifiedOldPath];
//  console.log('first');
//  for (i = 0; i < minDists1.length; i++) {
//    console.log(minDists1[i], ps1[i]);
//  }
//  console.log('second');
//  for (j = 0; j < minDists2.length; j++) {
//    console.log(minDists2[j], ps2[j]);
//  }
}

//
//
//var testPs1 = [
//  [0, 1],
//  [1, 1],
//  [1, 0],
//  [0, 0]
//];
//
//var testPs2 = [
//  [0, 0],
//  [0, 1],
//  [0, 2],
//  [1, 2],
//  [2, 2],
//  [2, 1],
//  [2, 0],
//  [1, 0]
//];
//
//splicePaths(testPs1, testPs2);

module.exports = splicePaths;

