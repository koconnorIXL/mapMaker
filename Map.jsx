var $ = require('jquery');
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
      .on('mousedown', this.handleMouseDown)
      .on('mouseup', this.handleMouseUp)
      .on('mousemove', this.handleMouseMove)
      .attr('xmlns', "http://www.w3.org/2000/svg");

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

    // Create and add all dataset paths.
    var datasetComponents = svg.selectAll(".datasetPaths")
      .data(this.props.datasets)
      .enter().append("g")
        .attr("class", function(d) { return datasetOptions[d.name].collectiveName; });

    datasetComponents.each(function(dataset) {
      // Add a path component for each path in this dataset.

      // Get the json for this dataset.
      var filename = datasetOptions[dataset.name].filename;
      var name = filename.substring(0, filename.length - 5);
      var json = jsonGetter(filename);

      // Get the color scheme, selected sub-options, and base class name for this dataset.
      var datasetColors = dataset.colors;
      var selectedSubOptions = dataset.subOptions;
      var commonClassName = datasetOptions[dataset.name].individualName;

      // Create a path component for each feature in this dataset.
      var node = d3.select(this);
      node.selectAll("path")
        .data(topojson.feature(json, json.objects[name]).features)
        .enter().append("path")
        .attr("d", function(feature) { return path(feature); })
        .attr("class", function(feature) { 
          var subOptionForPath;
          if (dataset.name == 'Countries') {
            subOptionForPath = feature.properties.continent;
          }
          if (dataset.name == 'States/Provinces') {
            subOptionForPath = feature.properties.admin;
          }

          // If this feature is part of an unselected sub-option for its dataset, we do not want to
          // display a path for it, so we will add a 'hidden' tag.
          // Note that not all datasets have sub-options, so this only applies when there are
          // sub-options for the dataset.
          if (datasetOptions[dataset.name].subOptions.length > 0 && 
            selectedSubOptions.indexOf(subOptionForPath) == -1) 
          {
            return commonClassName + ' hidden';
          }
          return commonClassName; 
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

        // Add exterior boundaries for the dataset.
        node.append("path")
          .datum(topojson.mesh(json, json.objects[name], function(a,b) { return a === b; }))
          .attr("d", path)
          .attr("fill", "transparent");
    });
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

  getTopojson: function(filename) {
    if (!cache[filename]) {
      $.ajaxSetup({async: false});
      var data = JSON.parse($.get('topojsonDatasets/' + filename).responseText);
      $.ajaxSetup({async: true});
      cache[filename] = data;
    }
    return cache[filename];
  }
});

module.exports = Map;
