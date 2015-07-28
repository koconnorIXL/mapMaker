var d3 = require('d3');
var topojson = require('topojson');
var React = require('react');
var getProjection = require('./ProjectionUtils.js').getProjection;
var datasetOptions = require('./Datasets.jsx');

var mapSize = 800;

function getViewBox(scale, translate) {
  translate[0] *= -1;
  translate[1] *= -1;

  var min = mapSize / 2 * (1 - 1 / scale);
  var max = mapSize / 2 * (1 + 1 / scale);

  var minX = min + translate[0] - mapSize / 2;
  var maxX = max + translate[0] - mapSize / 2;
  var minY = min + translate[1] - mapSize / 2;
  var maxY = max + translate[1] - mapSize / 2;

  if (minX < 0) {
    maxX -= minX;
    minX = 0;
  }
  else if (maxX > mapSize) {
    minX -= (maxX - mapSize);
    maxX = mapSize;
  }
  if (minY < 0) {
    maxY -= minY;
    minY = 0;
  }
  else if (maxY > mapSize) {
    minY -= (maxY - mapSize);
    maxY = mapSize;
  }

  return [minX, minY, maxX, maxY].join(' ');
}

var cache = {};
var Map = React.createClass({

  componentDidMount: function() {
    this.redraw();
  },

  componentDidUpdate: function() {
    this.redraw();
  },

  redraw: function() {
    var projection = getProjection(this.props);
    var path = d3.geo.path().projection(projection);
    var jsonGetter = this.getTopojson;
    var getClassName = this.getClassName;

    this.mouseDown = false;
    var domNode = d3.select(this.getDOMNode());

    // Clear the old map.
    domNode.select('svg').remove();

    // Create the new one.
    var svg = domNode.append('svg')
      .attr('class', 'map')
      .attr('width', mapSize)
      .attr('height', mapSize)
      .on('wheel', this.handleMouseWheel)
//      .on('mousedown', this.handleMouseDown)
//      .on('mouseup', this.handleMouseUp)
//      .on('mousemove', this.handleMouseMove)
      .attr('xmlns', "http://www.w3.org/2000/svg");

    // Create and add all dataset paths.
    var datasetComponents = svg.selectAll(".datasetPaths")
      .data(this.props.datasets)
      .enter().append("g")
        .attr("class", function(d) { return datasetOptions[d.name].collectiveName; });

    datasetComponents.each(function(dataset) {
      // Get the json for this dataset.
      var filename = datasetOptions[dataset.name].filename;
      var name = filename.substring(0, filename.length - 5);

      jsonGetter(filename, function(json) {
        // Get the color scheme, selected sub-options, and base class name for this dataset.
        var datasetColors = dataset.colors;
        var selectedSubOptions = dataset.subOptions;
        var commonClassName = datasetOptions[dataset.name].individualName;

        // Create a path component for each feature in this dataset.
        var node = d3.select('svg.map g.' + datasetOptions[dataset.name].collectiveName);
        node.selectAll("path")
          .data(topojson.feature(json, json.objects[name]).features)
          .enter().append("path")
          .attr("d", function(feature) { return path(feature); })
          .attr("class", function(feature) { 
            return getClassName(feature, dataset, datasetOptions, commonClassName);
          })
          .attr("fill", function(feature) { 
            var chosenColorIndex = feature.properties.mapcolor7;

            switch (dataset.name) {
              case 'Countries':
                // The mapcolor7 property provided in the Countries dataset goes from 1 to 7, not 0 to 6.
                chosenColorIndex = chosenColorIndex - 1;
                break;
              case 'Lakes':
                // All lakes are the same color.
                chosenColorIndex = 0;
                break;
            }
            return datasetColors[chosenColorIndex]; 
          });

          // If this is the cities dataset, then we also want to add city labels.
          if (dataset.name == 'Cities') {
            node.selectAll(".city_label")
            .data(topojson.feature(json, json.objects[name]).features)
            .enter().append("text")
            .attr("class", function(feature) { 
              return getClassName(feature, dataset, datasetOptions, 'city_label');
            })
            .attr("dy", ".35em")
            .text(function(feature) { return feature.properties.NAME; })
            .attr("transform", function(feature) {
              var coords = projection(feature.geometry.coordinates);
              if (coords[0] === Infinity || coords[1] === Infinity) {
                // TODO: find a better solution for this - right now, I'm just hiding it off-screen.
                coords = [-10, -10];
              }
              return "translate(" + coords + ")";
            });
          }

          // Add exterior boundaries for the dataset.
          node.append("path")
            .datum(topojson.mesh(json, json.objects[name], function(a,b) { return a === b; }))
            .attr("d", path)
            .attr("fill", "transparent");
      }.bind(this));
    }.bind(this));

    if (this.props.showGridLines) {
      var graticuleGroup = svg.append('g').attr('class', 'graticuleGroup');

      graticuleGroup
        .append('path')
        .datum(d3.geo.graticule())
        .attr('class', 'graticule')
        .attr('d', path);
    }

    // Create and add all labels.
    var labelComponents = svg.selectAll("g")
      .data(this.props.labels)
      .enter().append("g")
        .attr("class", "mapLabel")
        .attr("key", function(d, i) { return i; });
        
    labelComponents.append("circle")
      .attr("cx", function(d) { return projection(d.coordinates)[0]; })
      .attr("cy", function(d) { return projection(d.coordinates)[1]; })
      .attr("r", 3);

    labelComponents.append("text")
      .attr("x", function(d) { return projection(d.coordinates)[0]; })
      .attr("y", function(d) { return projection(d.coordinates)[1]; })
      .attr("textAnchor", "start")
      .attr("dx", 5)
      .text(function(d) { return d.labelText; });
  },

  getClassName: function(feature, dataset, datasetOptions, commonClassName) {
    // If this feature is part of an unselected sub-option for its dataset, we do not want to
    // display a path for it, so we will add a 'hidden' to its class name list. 
    // Note that not all datasets have sub-options, so this only applies when there are
    // sub-options for the dataset.
    if (datasetOptions[dataset.name].subOptions.length > 0) {
      var subOptionForPath;
      if (dataset.name == 'Countries') {
        subOptionForPath = feature.properties.continent;
      }
      if (dataset.name == 'States/Provinces') {
        subOptionForPath = feature.properties.admin;
      }
      if (dataset.name == 'Cities') {
        // The Cities dataset gives the country for each city, but we must also use the Countries
        // dataset to map the country names to continents so that we can turn whole continents
        // of cities off and on. We therefore need to find the entry in the Countries dataset that
        // matches the country name for this city.
        var countryName = feature.properties.ADM0NAME;
        this.getTopojson('countries.json', function(json) {
          var countryDataset = json.objects.countries.geometries;
          for (var i = 0; i < countryDataset.length; i++) {
            if (countryDataset[i].properties.name === countryName || 
              countryDataset[i].properties.name_long === countryName ||
              countryDataset[i].properties.subunit === countryName) 
            {
              subOptionForPath = countryDataset[i].properties.continent;
            }
          }
        });
      }

      // If this path is part of an unselected sub-option or if it is a city that is too small to
      // display, we will hide it.
      if (dataset.subOptions.indexOf(subOptionForPath) == -1) {
        return commonClassName + ' hidden';
      }

      // Cities have more filters than the other datasets.
      if (dataset.name == 'Cities' &&
        (feature.properties.SCALERANK > dataset.filterInfo.minSize ||
        (dataset.filterInfo.stateCapitalsOnly && feature.properties.FEATURECLA !== 'Admin-1 capital') ||
        (dataset.name == 'Cities' && dataset.filterInfo.countryCapitalsOnly && feature.properties.FEATURECLA !== 'Admin-0 capital') ||
        (dataset.filterInfo.USOnly && feature.properties.ADM0NAME !== "United States of America")))
      {
        return commonClassName + ' hidden';
      }
    }
    return commonClassName; 
  },

  render: function() {
    return <div className="mapContainer"></div>;
  },
  
  handleMouseDown: function(e) {
    d3.event.preventDefault();
    this.mouseDown = true;
  },

  handleMouseUp: function(e) {
    this.mouseDown = false;
    this.lastX = null;
    this.lastY = null;
  },

  handleMouseMove: function(e) {
    if (this.mouseDown) {
      if (this.lastX) {
        var dx = d3.event.pageX - this.lastX;
        var dy = d3.event.pageY - this.lastY;
        this.props.dragRotate(dx, dy);
      }
      this.lastX = d3.event.pageX;
      this.lastY = d3.event.pageY;
    }
  },

  handleMouseWheel: function(e) {
    d3.event.preventDefault();
    if (d3.event.deltaY > 0) {
      this.props.zoomOut();
    }
    else if (d3.event.deltaY < 0) {
      this.props.zoomIn();
    }
  },

  getTopojson: function(filename, cb) {
    if (!cache[filename]) {
      d3.json('topojsonDatasets/' + filename, function(err, parsedJSON) {
        if (err) { console.log(err); }
        cache[filename] = parsedJSON;
        cb(parsedJSON);
      });
    }
    else {
      cb(cache[filename]);
    }
  }
});

module.exports = Map;
