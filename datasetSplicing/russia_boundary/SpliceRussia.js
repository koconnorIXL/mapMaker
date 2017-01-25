var fs = require('fs');
var d3 = require('d3');
var findLongest = require('../FindLongestCoordinateArray.js');

var boundary = JSON.parse(fs.readFileSync('geojsonDatasets/russia_boundary.json'));
var boundary_coordinates = boundary.features[0].geometry.coordinates[0]
var p0 = boundary_coordinates[0];
var p1 = boundary_coordinates[boundary_coordinates.length - 1];

var A = -p0[1] + p1[1];
var B = p0[0] - p1[0];
var C = B * p0[1] + A * p0[0];

var countries = JSON.parse(fs.readFileSync('../../geojsonDatasets/countries_high_res.json'));
var russia = countries.features.filter(function(feature) { 
  return feature.properties.NAME === 'Russia'; 
})[0];

var main_russia_coordinate_info = findLongest(russia);
var main_russia_coordinates = main_russia_coordinate_info.coordinates;
var all_russia_coordinates = russia.geometry.coordinates;

function d(p0, p1) {
  return Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2);
}

var indexClosestToP0 = 0;
var minDistToP0 = d(p0, main_russia_coordinates[0]);
var indexClosestToP1 = 0;
var minDistToP1 = d(p1, main_russia_coordinates[0]);
main_russia_coordinates.forEach(function(p, index) {
  var d0 = d(p, p0);
  var d1 = d(p, p1);
  if (d0 < minDistToP0) {
    minDistToP0 = d0;
    indexClosestToP0 = index;
  }
  if (d1 < minDistToP1) {
    minDistToP1 = d1;
    indexClosestToP1 = index;
  }
});

console.log(indexClosestToP0, indexClosestToP1);

var east_russia_coordinates = [];
var west_russia_coordinates = [];

var east = true;
for (var i = 0; i < main_russia_coordinates.length; i++) {
  var index = (indexClosestToP0 + i) % main_russia_coordinates.length;

  if (index === indexClosestToP1) {
    east = false;
  }

  if (east) {
    east_russia_coordinates.push(main_russia_coordinates[index]);
  }
  else {
    west_russia_coordinates.push(main_russia_coordinates[index]);
  }
}

west_russia_coordinates = [west_russia_coordinates.concat(boundary_coordinates)];
east_russia_coordinates = [east_russia_coordinates.concat(boundary_coordinates.reverse())];
console.log(west_russia_coordinates[0].length);
console.log(east_russia_coordinates[0].length);

var dummyProjection = d3.geo.equirectangular()
  .translate([0, 0])
  .rotate([-30, 0]);
var path = d3.geo.path();
path.projection(dummyProjection);

function centroid(ps) {
  var x = 0;
  var y = 0;
  ps.forEach(function(p) {
    x += p[0];
    y += p[1];
  });
  x /= ps.length;
  y /= ps.length;
  return [x, y];
}

var east_islands = [east_russia_coordinates];
var west_islands = [west_russia_coordinates];

// divvy up the islands
all_russia_coordinates.forEach(function(ps, index) {
  if (index === main_russia_coordinate_info.polygonIndex) {
    return;
  }
  var centroid = dummyProjection.invert(path.centroid({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: ps
    }
  }));
  if (centroid[0] < 0 || A * centroid[0] + B * centroid[1] < C) {
    east_islands.push(ps);
  }
  else {
    west_islands.push(ps);
  }
});

var west_russia = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'West_Russia'
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: west_islands 
      }
    }
  ]
};
var east_russia = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'East_Russia'
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: east_islands
      }
    }
  ]
};
fs.writeFileSync('geojsonDatasets/EastRussia.json', JSON.stringify(east_russia, null, '  '));
fs.writeFileSync('geojsonDatasets/WestRussia.json', JSON.stringify(west_russia, null, '  '));

