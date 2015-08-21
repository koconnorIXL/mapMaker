var React = require('react');
var getProjection = require('../ProjectionUtils.js').getProjection;
var ProjectionController = require('./ProjectionController.jsx');
var Map = require('./Map.jsx');
var SubcontrollerContainer = require('../SubcontrollerContainer.jsx');
var datasetOptions = require('../Datasets.jsx');
var Dataset = require('../Dataset.js');
var getProjection = require('../ProjectionUtils.js').getProjection;
var parse = require('parse-svg');
var SVGHelper = require('./SVGHelper.js');

var MAX_SCALE_RATIO = 8;

var RetrofitProjection = React.createClass({
  
  getInitialState: function() {
    return {
      rotate: [85.4, 2.4, -1.7],
      center: [-1, 39],
      scaleRatio: 1.48,
      clipAngle: null,
      width: 800,
      height: 800,
      translate: [5, 249],
      precision: null,
      projectionType: "albers",
      parallels: [24, 24],
      labels: [],
      datasets: [
        new Dataset(
          'Countries', 
          datasetOptions['Countries'].defaultColors, 
          datasetOptions['Countries'].subOptions,
          []),
        new Dataset(
          'States/Provinces', 
          datasetOptions['States/Provinces'].defaultColors, 
          ['United States of America'],
          [])],
      showGridLines: false
    };
  },

  changeState: function(o) {
    this.setState(o);
  },

  render: function() {

    // get the proposed projection to extract paths from the colonies svg
    var projectionToInvert = getProjection({
      rotate: this.state.rotate,
      center: this.state.center,
      clipAngle: this.state.clipAngle,
      translate: this.state.translate,
      projectionType: this.state.projectionType,
      parallels: this.state.parallels,
      precision: this.state.precision,
      scale: this.state.scaleRatio * Math.max(this.state.width, this.state.height)});

    // parse the svg whose projection is unknown
    var request = new XMLHttpRequest();
    request.open('GET', '13colonies_edited.svg', false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200 && !this.parsedSVG) {
      var parsedSVG = parse(request.responseText);
      this.paths = SVGHelper.extractPaths(parsedSVG);
    }

    var latLongPaths = this.paths.map(function(pList) { return pList.map(projectionToInvert.invert); });

    return (
      <div>
        <SubcontrollerContainer
          {...this.state}
          type={ProjectionController}
          title="Projection Options"
          maxScaleRatio={MAX_SCALE_RATIO}
          changeState={this.changeState}
        />
        <Map 
          {...this.state}
          projection={d3.geo.albers().rotate([90, 0, 0])}
          translate={[this.state.width / 2, this.state.height / 2]}
          scale={this.state.scaleRatio * Math.max(this.state.width, this.state.height)}
          clipExtent={[[0, 0], [this.state.width, this.state.height]]}
          randomData={latLongPaths}
        />
      </div>
    );
  }
});

React.render(<RetrofitProjection />, document.querySelector('body'));
