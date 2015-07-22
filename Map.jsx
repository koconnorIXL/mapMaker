var getProjection = require('./ProjectionUtils.js').getProjection;
var datasetOptions = require('./Datasets.jsx');

var cache = {};
var Map = React.createClass({

  render: function() {
    var projection = getProjection(this.props);
    var path = d3.geo.path().projection(projection);
    this.mouseDown = false;

    var counter = 0; 
    var labels = this.props.labels.map(function(label) {
      var p = projection(label.coordinates);
      return (
        <g key={counter++} className="mapLabel">
          <circle cx={p[0]} cy={p[1]} r={3} />
          <text x={p[0]} y={p[1]} textAnchor="start" dx="5">{label.labelText}</text>
        </g>
      );
    });

    var datasets = [];
    for (var i = 0; i < this.props.datasets.length; i++) {
      datasetName = this.props.datasets[i].name;
      var dataset = datasetOptions[datasetName];
      var datasetColors = this.props.datasets[i].colors;
      // If the user hasn't picked colors yet, use the default ones.
      if (datasetColors == undefined) {
        datasetColors = dataset.defaultColors;
      }
      var filename = dataset.filename;
      var name = filename.substring(0, filename.length - 5);

      var json = this.getTopojson(filename);
      var displayFeatures = topojson.feature(json, json.objects[name]).features.map(function(feature) {
        // Pick the appropriate fill color for this path.
        var chosenColorIndex = feature.properties.mapcolor7;
        switch (datasetName) {
          case 'Countries':
            // The mapcolor7 property provided in the Countries dataset goes from 1 to 7, not 0 to 6.
            chosenColorIndex = chosenColorIndex - 1;
            break;
          case 'Lakes':
            // All lakes are the same color.
            chosenColorIndex = 0;
            break;
        }

        return <path 
          className={dataset.individualName} 
          d={path(feature)} 
          fill={datasetColors[chosenColorIndex]} />;
      });
      datasets.push(<g className={dataset.collectiveName}>{displayFeatures}</g>);
    }

    return (
      <svg 
        className="map" 
        xmlns="http://www.w3.org/2000/svg" 
        width='800' 
        height='800'
        onWheel={this.handleMouseWheel}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        {labels}
        {datasets}
      </svg>
    );
  },
  
  handleMouseDown: function(e) {
    e.preventDefault();
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
        var dx = e.pageX - this.lastX;
        var dy = e.pageY - this.lastY;
        this.props.dragRotate(dx, dy);
      }
      this.lastX = e.pageX;
      this.lastY = e.pageY;
    }
  },

  handleMouseWheel: function(e) {
    e.preventDefault();
    if (e.deltaY > 0) {
      this.props.zoomOut();
    }
    else if (e.deltaY < 0) {
      this.props.zoomIn();
    }
  },

  getTopojson: function(filename) {
    if (!cache[filename]) {
      jQuery.ajaxSetup({async: false});
      var topojson = JSON.parse($.get('topojsonDatasets/' + filename).responseText);
      jQuery.ajaxSetup({async: true});
      cache[filename] = topojson;
    }
    return cache[filename];
  }
});

module.exports = Map;
