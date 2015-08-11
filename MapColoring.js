var fs = require('fs');
var topojson = require('topojson');

/** Returns true if a vertex is in S4 (defined here https://en.wikipedia.org/wiki/Five_color_theorem). */
function inS4(vertices, vertex) {
  return vertex.neighbors.length <= 4;
}

/** Returns true if a vertex is in S5 (defined here https://en.wikipedia.org/wiki/Five_color_theorem). */
function inS5(vertices, vertex) {
  if (vertex.neighbors.length === 5) {
    var hasValidNeighbor = false;
    vertex.neighbors.forEach(function(neighbor) {
      if (neighbor.neighbors.length <= 6) {
        hasValidNeighbor = true;
      }
    });

    return hasValidNeighbor;
  }
}

/** 
 * Removes a vertex from a graph.
 * More specifically, this method removes v from the vertices array,
 * and updates all elements of the vertices array to not have
 * v as a neighbor.
 */
function removeFromGraph(vertices, v) {
  v.neighbors.forEach(function(neighbor) {
    neighbor.neighbors.splice(neighbor.neighbors.indexOf(v), 1);
  });
  vertices.splice(vertices.indexOf(v), 1);
}

/** 
 * Adds a vertex to a graph which was previously removed.
 * More specifically, this method adds v to the vertices array,
 * and updates all elements of the vertices array which previously
 * had v as a neighbor to have v as a neighbor again.
 */
function addToGraph(vertices, v) {
  vertices.push(v);
  v.neighbors.forEach(function(neighbor) {
    neighbor.neighbors.push(v);
  });
}

/** Adds a color to v which is different than the colors of all of v.neighbors. */
function addColorDifferentFromNeighbors(v) {
  var possibleColors = [0, 1, 2, 3, 4];
  v.neighbors.forEach(function(neighbor) {
    var index = possibleColors.indexOf(neighbor.color);
    if (index >= 0) {
      possibleColors.splice(index, 1);
    }
  });
  v.color = possibleColors[0];
}

/** Simple class for a vertex in a graph. */
function Vertex(indices, neighbors) {
  this.indices = indices;
  this.neighbors = neighbors;
}

Vertex.prototype.isAdjacentTo = function(neighbor) {
  return this.neighbors.indexOf(neighbor) > -1;
};

Vertex.prototype.copy = function() {
  return new Vertex(this.indices, this.neighbors);
}

Vertex.prototype.toString = function() {
  return this.indices.toString();
}

Vertex.prototype.names = function(geometryCollection) {
  return this.indices.map(function(i) { 
    var name = geometryCollection[i].properties.name; 
    if (this.color || this.color === 0) {
      name += ' (color' + this.color + ')';
    }
    return name;
  }.bind(this));
}

/** Utility method for debugging. */
function listNeighbors(geometryCollection, v) {
  console.log('Vertex: ' + v.names(geometryCollection));
  var names = [];
  v.neighbors.forEach(function(neighbor) {
    names = names.concat(neighbor.names(geometryCollection));
  });
  console.log('Neighbors:');
  console.log(names);
}

exports.fastFiveColoring = function(geometryCollection) {
  var vertices;
  var vertices2;
  function coloring5() {
    if (vertices.length === 0) { return; }
  
    // remove duplicate edges from graph
    vertices.forEach(function(vertex) {
      var indicesToRemove = [];
      vertex.neighbors.forEach(function(neighbor, index) {
        if (vertex.neighbors.indexOf(neighbor) < index) {
          indicesToRemove.push(index);
        }
      });
      
      for (var i = indicesToRemove.length - 1; i >= 0; i--) {
        vertex.neighbors.splice(i, 1);
      }
    });
  
    // All vertices with degree at most 4
    var S4 = [];
  
    // Keep deleting nodes of degree <= 4 from the graph until we can't find anymore
    var stop = false;
    while (!stop) {
      stop = true;
      vertices.forEach(function(v, i) {
        if (inS4(vertices, v)) {
          stop = false;
          S4.push(v);
          removeFromGraph(vertices, v);
        }
      });
    }
  
    // All remaining vertices with degree 5, and at least one neighbor with degree at most 6
    var S5 = [];
  
    // initialize S5
    vertices.forEach(function(vertex, i) {
      if (inS5(neighbors, i)) {
        S5.push(i);
      }
    });
  
    var V;
    var V1;
    var V2;
    if (S5.length > 0) {
      // find V, V1, and V2 such that:
      //   V is in S5
      //   V1 and V2 are neighbors of V
      //   V1 and V2 are not neighbors of each other
      //   V1 and V2 have at most 7 neighbors
      var found = false;
      for (var i = 0; i < S5.length && !found; i++) {
        V = S5[i];
        var neighbors = V.neighbors;
        for (var j = 0; j < neighbors.length && !found; j++) {
          V1 = neighbors[j];
          if (V1.neighbors.length <= 7) {
            for (var k = j + 1; k < neighbors.length; k++) {
              V2 = neighbors[k];
              if (V2.neighbors.length <= 7 && !V1.isAdjacentTo(V2)) {
                found = true;
                break;
              }
            }
          }
        }
      }
  
      // remove V from the graph
      removeFromGraph(vertices, V);
  
      // create a new vertex that combines V1 and V2
      var newNeighbors = V1.neighbors;
      for (var i = 0; i < V2.neighbors.length; i++) {
        if (newNeighbors.indexOf(V2.neighbors[i]) < 0) {
          newNeighbors.push(V2.neighbors[i]);
        }
      }
  
      V12 = new Vertex(V1.indices.concat(V2.indices), newNeighbors);
  
      // remove V1 and V2 from the graph and replace them with V12
      removeFromGraph(vertices, V1);
      removeFromGraph(vertices, V2);
      addToGraph(vertices, V12);
    }
  
    // Now, solve the coloring problem for this simplified graph
    coloring5(vertices);
  
    // if we had to do the S5 step, be careful about adding the appropriate vertices back to the graph
    if (S5.length > 0) {
      removeFromGraph(vertices, V12);
      addToGraph(vertices, V1);
      addToGraph(vertices, V2);
  
      V1.color = V12.color;
      V2.color = V12.color;
      addColorDifferentFromNeighbors(V);
    }
  
    // add and color all the nodes that were removed from the graph for having degree <= 4
    while (S4.length > 0) {
      var v = S4.pop();
      addToGraph(vertices, v);
      addColorDifferentFromNeighbors(v);
    }
  }
  var neighborLists = topojson.neighbors(geometryCollection);

  // Convert neighborLists into a format which the coloring5 method is expecting
  vertices = neighborLists.map(function(neighbors, index) { return new Vertex([index], neighbors); });
  vertices.forEach(function(v) {
    v.neighbors = v.neighbors.map(function(index) { return vertices[index]; });
  });

  vertices2 = vertices.slice();
  
  // Execute the algorithm
  coloring5(vertices);

  // Get the colors and return an array of a color for each object in the geometryCollection.
  return vertices2.map(function(v) { return v.color; });
}


/** Helper method for computing brute force colorings. */
function bruteForceColoringHelper(neighbors, assignedColors, nColors) {
  // Terminating condition. If we have gotten this far, then assignedColors is a valid coloring.
  if (assignedColors.length === neighbors.length) {
    return assignedColors;
  }

  // Go through each possible color for the current vertex we are up to.
  for (var i = 0; i < nColors; i++) {
    var colorOK = true;

    // check if any of the vertex's neighbors are this color
    neighbors[i].forEach(function(neighbor) {
      if (neighbor < assignedColors.length && assignedColors[neighbor] === i) {
        // if a neighbor has this color, then this color will not work for the current vertex
        colorOK = false;
      }
    });

    // if no neighbors have this color, then we can use it for this vertex.
    if (colorOK) {
      // record that we are using color i for this vertex
      assignedColors.push(i);

      // try to compute colors for the rest of the vertices.
      var res = bruteForceColoringHelper(neighbors, assignedColors);

      // if we succeeded, then return the coloring
      if (res) { 
        return res;
      }

      // otherwise, we cannot use color i for this vertex. Continue looping over possible colors.
      assignedColors.pop();
    }
  }
}

/** 
 * Returns a list of colors for each element in a geometry collection,
 * computed using a brute force algorithm. Not recommended to use this
 * with nColors < 6.
 */
exports.bruteForceColoring = function(geometryCollection, nColors) {
  var neighbors = topojson.neighbors(geometryCollection);
  return bruteForceColoringHelper(neighbors, [], nColors);
}


