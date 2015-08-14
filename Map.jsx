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
            // If there's a specific color specified for this feature, use that one.
            var pathColors = dataset.pathColors.filter(function(element) { return element.name === feature.properties.name; });
            if (pathColors.length > 0) {
              return pathColors[0].color;
            }

            // Otherwise, use the appropriate overall dataset colors.
            var chosenColorIndex = feature.properties.mapcolor5;

            switch (dataset.name) {
              case 'Lakes':
                // All lakes are the same color.
                chosenColorIndex = 0;
                break;
              case 'Cities':
                chosenColorIndex = getColorIndexForCity(feature);
            }
            return datasetColors[chosenColorIndex]; 
          })
          .attr("stroke", function(feature) {
            if (dataset.name == 'Cities') {
              return datasetColors[getColorIndexForCity(feature)];
            }
            // For all other datasets, stroke is black.
            return "#000000";
          });

          // If this is the cities dataset, then we also want to add city labels.
          if (dataset.name == 'Cities') {
            var labelAnchors = [];
            var labelAnchorLinks = [];

            // Add a label and reference point for each city that's displayed.
            d3.selectAll("." + datasetOptions[dataset.name].individualName + ":not(.hidden)").each(function(feature) {
              // Only include cities that are currently within the bounding box.
              var coords = projection(feature.geometry.coordinates);
              if (0 < coords[0] && coords[0] < width && 0 < coords[1] && coords[1] < height) {
                labelAnchors.push({
                  feature: feature,
                  x: coords[0],
                  y: coords[1],
                  fixed: true
                });
                labelAnchors.push({
                  feature: feature
                });
              }
            });

            // Link labels to their reference points.
            for (var i = 0; i < labelAnchors.length/2; i++) {
              labelAnchorLinks.push({
                source : i * 2,
                target : i * 2 + 1,
                weight : 1
              });
            }

            // Run the force.
            var force = d3.layout.force()
              .nodes(labelAnchors)
              .links(labelAnchorLinks)
              .gravity(0)
              .linkDistance(0)
              .linkStrength(8)
              .charge(function(node) {
                return -10 * node.feature.properties.name.length * node.feature.properties.name.length; 
              })
              .chargeDistance(85)
              .friction(0.95)
              .size([width, height]);
            force.start();

            // Make the labels.
            var labelHolders = svg.selectAll(".city_label_holder")
              .data(force.nodes())
              .enter().append("g")
              .attr("class", "city_label_holder");

            labelHolders.append("text")
              .attr("class", 'city_label')
              .text(function(node, i) { return i % 2 == 0 ? "" : node.feature.properties.name; }) // Don't put text in for the reference nodes.
              .attr("fill", function(node) { return datasetColors[getColorIndexForCity(node.feature)]; })
              .attr("font-family", dataset.styleInfo.font)
              .attr("font-size", dataset.styleInfo.fontSize);

            force.on("tick", function() {
              labelHolders.each(function(d, i) {
                if(i % 2 == 1) {
                  d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
                }
              });
            });
          }
          else if (dataset.name !== 'Disputed Boundaries') {
            // Add exterior boundaries for the dataset.
            node.append("path")
              .datum(topojson.mesh(json, json.objects[name], function(a,b) { return a === b; }))
              .attr("d", path)
              .attr("class", "datasetOutline");
          }
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
    var labelComponents = svg.selectAll("g.mapLabel")
      .data(this.props.labels.filter(function(element) { return element.type === 'point'; }))
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

    if (dataset.name == 'Cities') {
      // If this city has been specifically specified as a label to include, don't run it through any other
      // filters.
      if (this.props.labels.filter(function(element) {
        return element.type === 'city-show' && element.name === feature.properties.name; 
      }).length > 0) {
        return commonClassName;
      }

      // Similarly, if it's been specifically specified as a city to hide, hide it.
      if (this.props.labels.filter(function(element) {
        return element.type === 'city-hide' && element.name === feature.properties.name; 
      }).length > 0) {
        return commonClassName + " hidden";
      }

      // Cities have more filters than the other datasets.
      if (feature.properties.population < dataset.filterInfo.minSize ||
        (dataset.filterInfo.stateCapitalsOnly && feature.properties.feature_code !== 'PPLA') ||
        (dataset.name == 'Cities' && dataset.filterInfo.countryCapitalsOnly && feature.properties.feature_code !== 'PPLC') ||
        (dataset.filterInfo.USOnly && feature.properties.country_code !== "US"))
      {
        return commonClassName + ' hidden';
      }
    }

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
        var countryCode = feature.properties.country_code;
        this.getTopojson('countries.json', function(json) {
          var countryDataset = json.objects.countries.geometries;
          for (var i = 0; i < countryDataset.length; i++) {
            if (countryDataset[i].properties.iso_a2 === countryCode) {
              subOptionForPath = countryDataset[i].properties.continent;
              break;
            }
          }
        });
      }

      // If this path is part of an unselected sub-option or if it is a city that is too small to
      // display, we will hide it.
      if (dataset.subOptions.indexOf(subOptionForPath) == -1) {
        return commonClassName + ' hidden';
      }
    }
    return commonClassName; 
  },

  getColorIndexForCity: function(feature) {
    // Capital cities can have a different color from regular cities.
    var chosenColorIndex = 0;
    if (feature.properties.feature_code == 'PPLA') {
      chosenColorIndex = 1;
    } else if (feature.properties.feature_code == 'PPLC') {
      chosenColorIndex = 2;
    }
    return chosenColorIndex;
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
