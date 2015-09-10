var d3 = require('d3');
var topojson = require('topojson');
var React = require('react');
var seedrandom = require('seedrandom');
var getProjection = require('./ProjectionUtils.js').getProjection;
var datasetOptions = require('./Datasets.jsx');
var labelPoints = require('./LabelPoints.jsx');
var US_DATA = require('./USData.js');
var jsonGetter = require('./JSONGetter.js').getTopojson;

var mapSize = 800;
var defaultStrokeWidth = 0.5;
var defaultPointRadius = 4.5;
var starSizeMultiplier = 4;
var pathLabelAreaMinimum = 10000;
var boundingBoxMarginMultiplier = 1.1;
var compassRoseSize = 100;

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
    var getClassName = this.getClassName;
    var getColorIndexForCity = this.getColorIndexForCity;
    var width = this.props.width;
    var height = this.props.height;
    var strokeWidth = defaultStrokeWidth;
    var pointRadius = defaultPointRadius;

    this.mouseDown = false;
    var domNode = d3.select(this.getDOMNode());

    // Clear the old map.
    domNode.select('svg').remove();

    // Create the new one.
    var svg = domNode.append('svg')
      .attr('class', 'map')
      .attr('width', width)
      .attr('height', height)
//      .on('wheel', this.handleMouseWheel)
//      .on('mousedown', this.handleMouseDown)
//      .on('mouseup', this.handleMouseUp)
//      .on('mousemove', this.handleMouseMove)
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('xmlns', "http://www.w3.org/2000/svg");

    // Create and add all dataset paths.
    var datasetComponents = svg.selectAll(".datasetPaths")
      .data(this.props.datasets)
      .enter().append("g")
        .attr("class", function(d) { return datasetOptions[d.name].collectiveName; });

    var reactObj = this;
    var zoomScale = 1;

    datasetComponents.each(function(dataset) {
      // Get the json for this dataset.
      var filename = datasetOptions[dataset.name].filename;
      var name = filename.substring(0, filename.length - 5);

      jsonGetter(filename, function(json) {
        var features = topojson.feature(json, json.objects[name]).features;

        // Get the color scheme, selected sub-options, and base class name for this dataset.
        var datasetColors = dataset.colors;
        var selectedSubOptions = dataset.subOptions;
        var commonClassName = datasetOptions[dataset.name].individualName;
        if (!dataset.showPathLabels) {
          commonClassName += " no-label";
        }

        // Create a path component for each feature in this dataset.
        var node = d3.select('svg.map g.' + datasetOptions[dataset.name].collectiveName);
        var paths = node.selectAll("path")
          .data(features)
          .enter().append("path")
          .attr("d", function(feature) { 
            path.pointRadius(pointRadius);
            return path(feature); 
          })
          .attr("class", function(feature) { 
            return "feature-path " + getClassName(feature, dataset, datasetOptions, commonClassName);
          })
          .style("stroke-width", strokeWidth)
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
          var starPoints = [];
          var mapBoundingBox = svg.attr('viewBox').split(' ');
          var mapLeftX = parseFloat(mapBoundingBox[0]);
          var mapTopY = parseFloat(mapBoundingBox[1]);
          var mapWidth = parseFloat(mapBoundingBox[2]);
          var mapHeight = parseFloat(mapBoundingBox[3]);

          // Add a label and reference point for each city that's displayed.
          d3.selectAll("." + datasetOptions[dataset.name].individualName + ":not(.hidden)").each(function(feature) {
            // Only include cities that are currently within the bounding box.
            var coords = projection(feature.geometry.coordinates);
            var isStarPoint = false;
            if (reactObj.isInView(coords, svg)) {
            // If this city should have a star icon, add it to that list.
              if ((dataset.styleInfo.useStarForStateCapitals && feature.properties.feature_code === 'PPLA') ||
                (dataset.styleInfo.useStarForCountryCapitals && feature.properties.feature_code === 'PPLC')) {
                isStarPoint = true;

                starPoints.push({
                  x: coords[0],
                  y: coords[1]
                });
              }

              // For the purposes of the force, modify these coordinates to correspond to coordinates
              // within the view box.
              coords[0] = (coords[0]-mapLeftX) * svg.attr("width") / mapWidth;
              coords[1] = (coords[1] - mapTopY) * svg.attr("height") / mapHeight;
              labelAnchors.push({
                feature: feature,
                x: coords[0],
                y: coords[1],
                fixed: true
              });
              labelAnchors.push({
                feature: feature,
                x: coords[0],
                y: coords[1],
                isStarPoint: isStarPoint
              });
            }
          });

          // Add star icons as markers for the cities that need them.
          svg.selectAll("image")
            .data(starPoints)
            .enter().append("svg:image")
            .attr("xlink:href", "capital_city_marker.svg")
            .attr("width", 2*starSizeMultiplier*pointRadius)
            .attr("height", 2*starSizeMultiplier*pointRadius)
            .attr("x", function(d) { return d.x - starSizeMultiplier*pointRadius; })
            .attr("y", function(d) { return d.y - starSizeMultiplier*pointRadius; });

          // Link labels to their reference points.
          for (var i = 0; i < labelAnchors.length / 2; i++) {
            labelAnchorLinks.push({
              source: i * 2,
              target: i * 2 + 1,
              weight: 1
            });
          }

          // Make the labels.
          var labelHolders = svg.selectAll(".city_label_holder")
            .data(labelAnchors)
            .enter().append("g")
            .attr("class", "city_label_holder")
            .attr("transform", function(d) {
              return "translate(" + d.x + "," + d.y + ")";
            })
            .attr("visibility", "hidden");

          labelHolders.append("text")
            .attr("class", 'city_label')
            .text(function (node, i) {
              return i % 2 == 0 ? "" : node.feature.properties.name;
            }) // Don't put text in for the reference nodes.
            .attr("fill", function (node) {
              return datasetColors[getColorIndexForCity(node.feature)];
            });

          // Run the force.
          // Set a seed so that the labels are always placed in the same way.
          seedrandom("seed", { global: true });

          var force = d3.layout.force()
            .nodes(labelAnchors)
            .links(labelAnchorLinks)
            .gravity(0)
            .linkDistance(function (link, index) {
              return link.target.isStarPoint ? starSizeMultiplier*defaultPointRadius : defaultPointRadius;
            })
            .linkStrength(8)
            .charge(function (node) {
              return -10 * node.feature.properties.name.length * node.feature.properties.name.length;
            })
            .chargeDistance(85)
            .friction(0.95)
            .size([reactObj.props.width, reactObj.props.height])
            .on("tick", function () {
              labelHolders.each(function (d, i) {
                if (i % 2 == 1) {
                  // Get the size of the label.
                  var labelWidth = this.getBBox().width;
                  var labelHeight = this.getBBox().height;

                  // Keep labels within the area of the map.
                  d.x = Math.max(0, Math.min(parseFloat(svg.attr("width")) - labelWidth, d.x));
                  d.y = Math.max(0, Math.min(parseFloat(svg.attr("height")) - labelHeight, d.y));
                }
              });
            });

          force.start();
          for (var i = 0; i < 100; i++) force.tick();
          force.stop();

          // Make the labels visible and put them in the correct locations.
          labelHolders.each(function (d, i) {
            if (i % 2 == 1) {
              d3.select(this)
                .attr("transform", "translate("
                + (mapLeftX + (d.x * mapWidth/parseFloat(svg.attr("width"))))
                + "," + (mapTopY + (d.y * mapHeight/parseFloat(svg.attr("height")))) + ")")
                .attr("visibility", "visible");

              d3.select(this).select("text").attr("transform", "scale(" + (1/zoomScale) + ")");
            }
          });
        }
        else if (dataset.showOutline) {
          // Add exterior boundaries for the dataset.
          node.append("path")
            .datum(topojson.mesh(json, json.objects[name], function(a,b) { return a === b; }))
            .attr("d", path)
            .attr("class", "datasetOutline");
        }

        this.createPathLabels(svg, zoomScale);
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

    // Create and add all labels specifically listed.
    var pointLabelComponents = svg.selectAll("g.mapLabel")
      .data(this.props.labels.filter(function(element) { return element.type === 'point'; }))
      .enter().append("g")
        .attr("class", "mapLabel")
        .attr("key", function(d, i) { return i; });
        
    pointLabelComponents.append("circle")
      .attr("cx", function(d) { return projection(d.coordinates)[0]; })
      .attr("cy", function(d) { return projection(d.coordinates)[1]; })
      .attr("r", 3);

    pointLabelComponents.append("text")
      .attr("x", function(d) { return projection(d.coordinates)[0]; })
      .attr("y", function(d) { return projection(d.coordinates)[1]; })
      .attr("textAnchor", "start")
      .attr("dx", 5)
      .text(function(d) { return d.labelText; });

    // Add continent/ocean labels.
    this.addExtraLabels(svg, zoomScale);

    // Add a compass rose in the upper left corner of the map if requested.
    if (this.props.showCompassRose) {
      svg.append("svg:image")
        .attr("class", "compassRose")
        .attr("width", compassRoseSize/zoomScale)
        .attr("height", compassRoseSize/zoomScale)
        .attr("x", parseFloat(svg.attr('viewBox').split(' ')[0]))
        .attr("y", parseFloat(svg.attr('viewBox').split(' ')[1]))
        .attr("xlink:href", "simple_compass_rose.svg");
    }
  },

  addExtraLabels: function(svg, zoomScale) {
    var projection = getProjection(this.props);

    var extraLabelData = [];
    if (this.props.showCachedUSStateLabels) {
      extraLabelData = extraLabelData.concat(labelPoints.usStateLabelInfo);
    }
    if (this.props.showContinentLabels) {
      extraLabelData = extraLabelData.concat(labelPoints.continentLabelInfo);
    }
    if (this.props.showOceanLabels) {
      extraLabelData = extraLabelData.concat(labelPoints.oceanLabelInfo);
    }
    extraLabelData = extraLabelData.filter(function (d) {
      return this.isInView(projection([d.long, d.lat]), svg);
    }.bind(this));

    // Create new map labels if necessary.
    var labelComponents = svg.selectAll(".mapLabel")
      .data(extraLabelData);

    labelComponents.enter().append("text")
      .attr("class", function (d) {
        if (d.largeDisplay) {
          return "mapLabel large";
        }
        return "mapLabel small";
      })
      .attr("key", function (d, i) {
        return i;
      })
      .attr("textAnchor", "middle")
      .attr("dx", 5);

    // Remove labels that are no longer on screen.
    labelComponents.exit().remove();

    // Update sizes of labels.
    labelComponents
      .attr("transform", function (d) {
        return "translate(" + projection([d.long, d.lat])[0] + "," + projection([d.long, d.lat])[1] +
          ")scale(" + Math.min(1 / zoomScale) + ")";
      })
      .text(function (d) { return d.label; });

    // Add connecting lines between labels and anchor points, for those that have anchor points (e.g. fly-out labels for US states).
    labelComponents.each(function(d) {
      if (d.anchorPoint) {
        var anchorPointCoords = projection([d.anchorPoint.long, d.anchorPoint.lat]);

        // We want to connect the anchor point to the nearest corner of the label.
        var labelWidth = this.getBBox().width;
        var labelHeight = this.getBBox().height;
        // Since the labels are centered, we must adjust our corner location calculations.
        var labelPointX = projection([d.long, d.lat])[0] - labelWidth/2;
        var labelPointY = projection([d.long, d.lat])[1];

        if (Math.abs(anchorPointCoords[0] - labelPointX) > Math.abs(anchorPointCoords[0] - labelPointX - labelWidth)) {
          // The other side of the box is closer along the x dimension.
          labelPointX = labelPointX + labelWidth;
        }
        if (Math.abs(anchorPointCoords[1] - labelPointY) > Math.abs(anchorPointCoords[1] - labelPointY - labelHeight)) {
          // The other side of the box is closer along the y dimension.
          labelPointY = labelPointY + labelHeight;
        }

        svg.append("svg:line")
          .datum(d)
          .attr("class", "labelLink")
          .attr("x1", anchorPointCoords[0])
          .attr("y1", anchorPointCoords[1])
          .attr("x2", labelPointX)
          .attr("y2", labelPointY)
          .attr("stroke", "black");
      }
    })
  },

  isInView: function(coords, svg) {
    var mapBoundingBox = svg.attr('viewBox').split(' ');
    var mapLeftX = parseFloat(mapBoundingBox[0]);
    var mapTopY = parseFloat(mapBoundingBox[1]);
    var mapRightX = parseFloat(mapBoundingBox[0]) + parseFloat(mapBoundingBox[2]);
    var mapBottomY = parseFloat(mapBoundingBox[1]) + parseFloat(mapBoundingBox[3]);

    return coords &&
      mapLeftX < coords[0] &&
      coords[0] < mapRightX &&
      mapTopY < coords[1] &&
      coords[1] < mapBottomY;
  },

  createPathLabels: function(svg, zoomScale) {
    var path = d3.geo.path().projection(getProjection(this.props));
    // Create a list of the features for all the paths that need labels.
    var pathFeaturesForLabels = [];

    var mapBoundingBox = svg.attr('viewBox').split(' ');
    var mapLeftX = parseFloat(mapBoundingBox[0]);
    var mapTopY = parseFloat(mapBoundingBox[1]);
    var mapRightX = parseFloat(mapBoundingBox[0]) + parseFloat(mapBoundingBox[2]);
    var mapBottomY = parseFloat(mapBoundingBox[1]) + parseFloat(mapBoundingBox[3]);

    svg.selectAll("path.feature-path:not(.hidden):not(.no-label)").each(function (feature) {
      var bounds = path.bounds(feature);
      var dx = Math.max(0, (Math.min(bounds[1][0], mapRightX) - Math.max(bounds[0][0], mapLeftX))) * zoomScale;
      var dy = Math.max(0, (Math.min(bounds[1][1], mapBottomY) - Math.max(bounds[0][1], mapTopY))) * zoomScale;

      // If this path is big enough in the current display to get its own label, add it to the list.
      if (dx * dy !== Infinity && dx * dy > pathLabelAreaMinimum) {
        pathFeaturesForLabels.push(feature);
      }
    }.bind(this));

    var pathLabels = svg.selectAll(".path-label").data(pathFeaturesForLabels);

    // If a path is now big enough to deserve a label, add one.
    pathLabels.enter().append("text")
      .attr("class", "path-label")
      .attr("dy", ".35em");

    // If a path has become too small for a label, remove its label.
    pathLabels.exit().remove();

    // Resize all existing labels.
    pathLabels
      .transition()
      .duration(1) // We want instantaneous transition.
      .attr("transform", function(d) {
        return "translate(" + path.centroid(d) + ")scale(" + (1/zoomScale) + ")";
      })
      .text(function(d) { return d.properties.name; });
  },

  getClassName: function(feature, dataset, datasetOptions, commonClassName) {

    if (dataset.name == 'Cities') {
      // If this city has been specifically specified as a label to include, don't run it through any other
      // filters.
      if (dataset.filterInfo.giveShowCitiesPrecedence && this.props.labels.filter(function(element) {
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
      if ((dataset.filterInfo.stateCapitalsOnly && feature.properties.feature_code !== 'PPLA') ||
        (dataset.name == 'Cities' && dataset.filterInfo.countryCapitalsOnly && feature.properties.feature_code !== 'PPLC') ||
        (dataset.filterInfo.USOnly && feature.properties.country_code !== "US"))
      {
        return commonClassName + ' hidden';
      }

      // If the citiesToShow list was not given precedence, apply it here.
      if (!dataset.filterInfo.giveShowCitiesPrecedence && this.props.labels.filter(function(element) {
        return element.type === 'city-show' && element.name === feature.properties.name; 
      }).length > 0) {
        return commonClassName;
      }

      // Last, apply the size constraint, since it is most likely to be overridden.
      if (feature.properties.population < dataset.filterInfo.minSize) {
        return commonClassName + ' hidden';
      }

    }

    // If this feature is part of an unselected sub-option for its dataset, we do not want to
    // display a path for it, so we will add a 'hidden' to its class name list. 
    // Note that not all datasets have sub-options, so this only applies when there are
    // sub-options for the dataset.
    if (datasetOptions[dataset.name].subOptions.length > 0) {
      var subOptionForPath;
      if (dataset.name === 'Countries') {
        subOptionForPath = feature.properties.continent;
      }
      if (dataset.name === 'States/Provinces') {
        subOptionForPath = feature.properties.admin;
      }
      if (dataset.name === 'Counties') {
        subOptionForPath = US_DATA.stateFromFP(feature.properties.STATEFP);
      }
      if (dataset.name === 'Congressional Districts') {
        subOptionForPath = feature.properties.STATE;
      }
      if (dataset.name === 'Cities') {
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

    if (dataset.name === 'Counties') {
      commonClassName += ' ' + US_DATA.stateFromFP(feature.properties.STATEFP).replace(/\s/g, '_');
    }
    if (dataset.name === 'Congressional Districts') {
      commonClassName += ' ' + feature.properties.STATE.replace(/\s/g, '_') + feature.properties.CONG_DIST;
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
  }
});

module.exports = Map;
