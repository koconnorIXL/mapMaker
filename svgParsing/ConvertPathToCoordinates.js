 
var bezier = require('bezier');
var parse = require('svg-path-parser');

var NUM_POINTS_PER_BEZIER = 3;

var evalCubicBezier = function(x0, y0, x1, y1, x2, y2, x3, y3, t) {
  return [
    bezier([x0, x1, x2, x3], t),
    bezier([y0, y1, y2, y3], t)
  ];
};

var getBezierPointList = function(x0, y0, x1, y1, x2, y2, x3, y3) {
  var ps = [];
  for (var t = 1; t <= NUM_POINTS_PER_BEZIER; t++) {
    ps.push(evalCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3, t / NUM_POINTS_PER_BEZIER));
  }
  return ps;
};


function convertPathToCoordinates(pathDAttribute) {
  var parsed = parse(pathDAttribute);
  var currentCoordinate = null;
  var lastBezierControl = null;
  var coordinateList = [];
  for (var i = 0; i < parsed.length; i++) {
    var directive = parsed[i];
    switch (directive.code) {
      case 'M':
      case 'L':
        currentCoordinate = [directive.x, directive.y];
        coordinateList.push(currentCoordinate);
        break;
      case 'l':
        currentCoordinate = [currentCoordinate[0] + directive.x, currentCoordinate[1] + directive.y];
        coordinateList.push(currentCoordinate);
        break;
      case 'H':
        currentCoordinate = [directive.x, currentCoordinate[1]];
        coordinateList.push(currentCoordinate);
        break;
      case 'h':
        currentCoordinate = [currentCoordinate[0] + directive.x, currentCoordinate[1]];
        coordinateList.push(currentCoordinate);
        break;
      case 'V':
        currentCoordinate = [currentCoordinate[0], directive.y];
        coordinateList.push(currentCoordinate);
        break;
      case 'v':
        currentCoordinate = [currentCoordinate[0], currentCoordinate[1] + directive.y];
        coordinateList.push(currentCoordinate);
        break;
      case 'C':
        var resultC = getBezierPointList(
          currentCoordinate[0],
          currentCoordinate[1],
          directive.x1,
          directive.y1,
          directive.x2,
          directive.y2,
          directive.x,
          directive.y);
        resultC.forEach(function(p) { coordinateList.push(p); });
        lastBezierControl = [directive.x2, directive.y2];
        currentCoordinate = [directive.x, directive.y];
        break;
      case 'c':
        var resultc = getBezierPointList(
          currentCoordinate[0],
          currentCoordinate[1],
          currentCoordinate[0] + directive.x1,
          currentCoordinate[1] + directive.y1,
          currentCoordinate[0] + directive.x2,
          currentCoordinate[1] + directive.y2,
          currentCoordinate[0] + directive.x,
          currentCoordinate[1] + directive.y);
        resultc.forEach(function(p) { coordinateList.push(p); });
        lastBezierControl = [currentCoordinate[0] + directive.x2, currentCoordinate[1] + directive.y2];
        currentCoordinate = [currentCoordinate[0] + directive.x, currentCoordinate[1] + directive.y];
        break;
      case 'S':
        var x0 = directive.x2;
        var y0 = directive.y2;
        if (lastBezierControl) {
          x0 = lastBezierControl[0];
          y0 = lastBezierControl[1];
        }
        var resultS = getBezierPointList(
          currentCoordinate[0],
          currentCoordinate[1],
          x0,
          y0,
          directive.x2,
          directive.y2,
          directive.x,
          directive.y);
        resultS.forEach(function(p) { coordinateList.push(p); });
        lastBezierControl = [directive.x2, directive.y2];
        currentCoordinate = [directive.x, directive.y];
        break;
      case 's':
        var x0 = currentCoordinate[0] + directive.x2;
        var y0 = currentCoordinate[1] + directive.y2;
        if (lastBezierControl) {
          x0 = lastBezierControl[0];
          y0 = lastBezierControl[1];
        }
        var results = getBezierPointList(
          currentCoordinate[0],
          currentCoordinate[1],
          x0,
          y0,
          currentCoordinate[0] + directive.x2,
          currentCoordinate[1] + directive.y2,
          currentCoordinate[0] + directive.x,
          currentCoordinate[1] + directive.y);
        results.forEach(function(p) { coordinateList.push(p); });
        lastBezierControl = [currentCoordinate[0] + directive.x2, currentCoordinate[1] + directive.y2];
        currentCoordinate = [currentCoordinate[0] + directive.x, currentCoordinate[1] + directive.y];
        break;

      case 'Z':
      case 'z':
        currentCoordinate = coordinateList[0].slice();
        coordinateList.push(currentCoordinate);
        break;
      default:
        throw new Error("can't handle " + directive.code);
    }
  }
  return coordinateList;
}

module.exports = convertPathToCoordinates;

