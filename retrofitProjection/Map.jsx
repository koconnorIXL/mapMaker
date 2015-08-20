var d3 = require('d3');
var topojson = require('topojson');
var React = require('react');
var getProjection = require('../ProjectionUtils.js').getProjection;
var datasetOptions = require('../Datasets.jsx');

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
    var projection = this.props.projection;
    var path = d3.geo.path().projection(projection);
    var jsonGetter = this.getTopojson;
    var getClassName = this.getClassName;
    var getColorIndexForCity = this.getColorIndexForCity;
    var width = this.props.width;
    var height = this.props.height;

    this.mouseDown = false;
    var domNode = d3.select(this.getDOMNode());

    // Clear the old map.
    domNode.select('svg').remove();

    // Create the new one.
    var svg = domNode.append('svg')
      .attr('class', 'map')
      .attr('width', width)
      .attr('height', height)
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
          .attr("stroke", "#000000");

      }.bind(this));
    }.bind(this));

    var extraDataset = this.props.randomData;
    var g = svg.append('g').attr('class', 'extraDataContainer');

    g.selectAll('path')
      .data(this.props.randomData)
      .enter().append('path')
      .attr('class', 'extraData')
      .attr('d', function(pList) {
        var res = '';
        var haveAddedAPoint = false;
        for (var i = 0; i < pList.length; i++) {
          var p = projection(pList[i]);
          if (!p) { continue; }
          if (!haveAddedAPoint) {
            res += 'M ' + p[0] + ' ' + p[1];
            haveAddedAPoint = true;
          }
          else {
            res += ' L ' + p[0] + ' ' + p[1];
          }
        }
//        if (res.length > 0) {
//          res += 'Z';
//        }
        return res;
      });
  },

  render: function() {
    return <div className="mapContainer" />;
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

      // If this path is part of an unselected sub-option or if it is a city that is too small to
      // display, we will hide it.
      if (dataset.subOptions.indexOf(subOptionForPath) == -1) {
        return commonClassName + ' hidden';
      }
    }
    return commonClassName; 
  },

  getTopojson: function(filename, cb) {
    if (!cache[filename]) {
      d3.json('/~koconnor/mapMaker/topojsonDatasets/' + filename, function(err, parsedJSON) {
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
