var fs = require('fs');
var d3 = require('d3');
var topojson = require('topojson');

var datasetsToHandle = [
  'countries.json',
  // 'admin1.json',
  // 'usa.json',
  // 'disputed_boundaries.json',
  // 'USSR-geojson.json'
  // 'usa.json'
];

// We only want to worry about some countries.
var countriesToInclude = [
  "United States",
  "Canada",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Peru",
  "China",
  "India",
  "Japan",
  "Philippines",
  "Indonesia",
  "Mongolia",
  "Kazakhstan",
  "Pakistan",
  "Turkey",
  "Iran",
  "Saudi Arabia",
  "Egypt",
  "Algeria",
  "Libya",
  "Dem. Rep. Congo",
  "Kenya",
  "Angola",
  "South Africa",
  "Madagascar",
  "Russia",
  "Ukraine",
  "United Kingdom",
  "France",
  "Italy",
  "Spain",
  "Germany",
  "Sweden",
  "Australia",
  "New Zealand" 
];

var ERROR_MARGIN = 15;

datasetsToHandle.forEach(function(filename) {
  var name = filename.slice(0, filename.length - 5);

  // Get the data.
  console.log('reading ' + './topojsonDatasetsRaw/' + filename);
  var json = JSON.parse(fs.readFileSync('./topojsonDatasetsRaw/' + filename));
  
  // We need a projection to use for getting the bounds of the paths.
  var standardProjection = d3.geo.mercator();
  var path = d3.geo.path().projection(standardProjection);
  var features = topojson.feature(json, json.objects[name]).features;
  var pathNameToBounds = {};
  var pathNameToCentroid = {};

  // Get the bounds for all paths and store them.
  for (var i = 0; i < features.length; i++) {
    var feature = features[i];
    // Note: for datasets other than countries.json, be sure to eliminate this check.
    if (countriesToInclude.indexOf(feature.properties.name) !== -1) {
      var bounds = path.bounds(feature);
      // Note: For US states from usa.json, use NAME_1, not name.
      pathNameToBounds[feature.properties.name] = {
        leftX: bounds[0][0],
        topY: bounds[0][1],
        rightX: bounds[1][0],
        bottomY: bounds[1][1]
      };
      pathNameToCentroid[feature.properties.name] = path.centroid(feature);
    }
  }

  var csvLines = [];

  // For each path, compile lists of all other paths' locations with regard to this one.
  for (var currPath in pathNameToBounds) {
    var east = [];
    var west = [];
    var north = [];
    var south = [];
    var unclearVertical = [];
    var unclearHorizontal = [];

    var currPathData = pathNameToBounds[currPath];
    var currPathCentroid = pathNameToCentroid[currPath];

    for (var otherPath in pathNameToBounds) {
      if (otherPath !== currPath) {
        var log = false;
        otherPathData = pathNameToBounds[otherPath];
        otherPathCentroid = pathNameToCentroid[otherPath];

        // if (otherPath === "Illinois" && currPath === "Kentucky") {
        //   log = true;
        //   console.log("curr: (" + currPathData.leftX + "," + currPathData.topY + ") to (" + currPathData.rightX + "," + currPathData.bottomY + 
        //     "). other: (" + otherPathData.leftX + "," + otherPathData.topY + ") to (" + otherPathData.rightX + "," + otherPathData.bottomY + ")");
        // }

        if ((otherPathData.rightX - currPathData.leftX < ERROR_MARGIN  && currPathCentroid[0] - otherPathCentroid[0] > 0) 
          || (otherPath === "Alaska" && currPath !== "Hawaii")) 
        {
          if (log) console.log("west");
          west.push(otherPath);
        } else if (otherPathData.leftX - currPathData.rightX > -ERROR_MARGIN && currPathCentroid[0] - otherPathCentroid[0] < 0) {
          if (log) console.log("east");
          east.push(otherPath);
        } else {
          if (log) console.log("neither horiz");
          unclearHorizontal.push(otherPath);
        }

        if (log) console.log("north: " + otherPathData.bottomY + " < " + currPathData.topY);
        if (log) console.log("south: " + otherPathData.topY + " > " + currPathData.bottomY);
        if (otherPathData.bottomY - currPathData.topY < ERROR_MARGIN && currPathCentroid[1] - otherPathCentroid[1] > 0) {
          if (log) console.log("north");
          north.push(otherPath);
        } else if (otherPathData.topY - currPathData.bottomY > -ERROR_MARGIN && currPathCentroid[1] - otherPathCentroid[1] < 0) {
          if (log) console.log("south");
          south.push(otherPath);
        } else {
          unclearVertical.push(otherPath);
          if (log) console.log("unclear vert");
          // console.log("curr: (" + currPathData.leftX + "," + currPathData.topY + ") to (" + currPathData.rightX + "," + currPathData.bottomY + 
          //   "). other: (" + otherPathData.leftX + "," + otherPathData.topY + ") to (" + otherPathData.rightX + "," + otherPathData.bottomY + ")");
        }
      }
    }

    // Transform those lists into a csv line.
    // Format: currPath,east list,west list,unclear horizontal list,north list,south list,unclear vertical list.
    // All lists are semicolon-separated
    var csvLine = currPath + ',' + east.join(';') + ',' + west.join(';') + ',' + unclearHorizontal.join(';') + ','
      + north.join(';') + ',' + south.join(';') + ',' + unclearVertical.join(';');

    csvLines.push(csvLine);
  }

  var csvString = "Country name,Countries to the east,Countries to the west,Unclear east/west countries,"
    + "Countries to the north,Countries to the south,Unclear north/south countries\r\n"
    + csvLines.join("\r\n");

  fs.writeFile('./csvForHannah/' + name + ERROR_MARGIN + '.csv', csvString, function (err) { 
    console.log('trying to save...');
    if (err) throw err; 
    console.log("saved " + name);
  });
});

