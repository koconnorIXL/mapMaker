
function evalBezier(start, end, p0, p1, t) {
  return [
    Math.pow(1 - t, 3) * start[0]
      + 3 * Math.pow(1 - t, 2) * t * p0[0] 
      + 3 * (1 - t) * Math.pow(t, 2) * p1[0]
      + Math.pow(t, 3) * end[0],
    Math.pow(1 - t, 3) * start[1]
      + 3 * Math.pow(1 - t, 2) * t * p0[1] 
      + 3 * (1 - t) * Math.pow(t, 2) * p1[1]
      + Math.pow(t, 3) * end[1]
  ];
}

function search(elt) {
  var res = [];
  if (elt.nodeName === 'polygon') {
    var pList = [];
    var ps = elt.points;
    for (var i = 0; i < ps.length; i++) {
      pList.push([ps[i].x, ps[i].y]);
    }
    res.push(pList);
  }
  if (elt.nodeName === 'path') {
    var segList = elt.pathSegList;
    var lastP = null;
    var pList = [];
    for (var i = 0; i < segList.length; i++) {
      var seg = segList[i];
      
      // unknown
      switch (seg.pathSegType) {
        // closepath (z) 
        case 1:
          break;

        // move to rel (m)
        case 3:
          if (i !== 0) {
            res.push(pList);
            pList = [];
          }
          lastP = [lastP[0] + seg.x, lastP[1] + seg.y];
          pList.push(lastP);
          break;
        // move to abs (M)
        case 2:
          if (i !== 0) {
            res.push(pList);
            pList = [];
          }
          lastP = [seg.x, seg.y];
          pList.push(lastP);
          break;

        // line to abs (L)
        case 4:
          lastP = [seg.x, seg.y];
          pList.push(lastP);
          break;

        // line to rel (l)
        case 5:
          lastP = [lastP[0] + seg.x, lastP[1] + seg.y];
          pList.push(lastP);
          break;

        // curve to abs (C)
        case 6:
          for (var j = 0; j < 50; j++) {
            pList.push(evalBezier(
              lastP,
              [seg.x, seg.y],
              [seg.x1, seg.y1],
              [seg.x2, seg.y2],
              j / 50));
          }
          lastP = [seg.x, seg.y];
          break;

        // curve to rel (c)
        case 7:
          for (var j = 1; j <= 50; j++) {
            pList.push(evalBezier(
              lastP,
              [lastP[0] + seg.x, lastP[1] + seg.y],
              [lastP[0] + seg.x1, lastP[1] + seg.y1],
              [lastP[0] + seg.x2, lastP[1] + seg.y2],
              j / 50));
          }
          lastP = [lastP[0] + seg.x, lastP[1] + seg.y];
          break;
        
        default:
          console.log('seg type: ' + seg.pathSegType + ' not handled right now.');
          break;
      }
    }
    res.push(pList);
  }
  if (elt.children.length > 0) {
    for (var i = 0; i < elt.children.length; i++) {
      res = res.concat(search(elt.children[i]));
    }
  }

  return res;
}

exports.extractPaths = search;
