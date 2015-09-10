var React = require('react');
var topojson = require('topojson');
var ProjectionController = require('./ProjectionController.jsx');
var MapLabelManager = require('./MapLabelManager.jsx');
var MapQuestionBankTag = require('./MapQuestionBankTag.jsx');
var DatasetController = require('./DatasetController.jsx');
var Map = require('./Map.jsx');
var SubcontrollerContainer = require('./SubcontrollerContainer.jsx');
var datasetOptions = require('./Datasets.jsx');
var Dataset = require('./Dataset.js');
var PresetController = require('./PresetController.jsx');
var BoundingBoxHelper = require('./BoundingBoxHelper.jsx');
var jsonGetter = require('./JSONGetter.js').getTopojson;


var MAX_SCALE_RATIO = 20;

var MapMaker = React.createClass({
  
  getInitialState: function() {
    return {
      rotate: [0, 0, 0],
      center: [0, 0],
      scaleRatio: 0.6,
      clipAngle: null,
      width: 800,
      height: 800,
      precision: null,
      projectionType: "mercator",
      parallels: [30, 60],
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
      showGridLines: true 
    };
  },

  changeState: function(o) {
    this.setState(o);
  },

  zoomIn: function() {
    this.setState({
      scaleRatio: Math.min(this.state.scaleRatio + 0.1, MAX_SCALE_RATIO)
    });
  },

  zoomOut: function() {
    this.setState({
      scaleRatio: Math.max(this.state.scaleRatio - 0.1, 0)
    });
  },

  dragRotate: function(dx, dy) {
    var scale = this.state.scaleRatio * Math.max(this.state.width, this.state.height);
    var latitude = dy / scale * 600;
    var longitude = -dx / scale * 600;

    var newLongitude = (540 + this.state.center[0] + longitude) % 360 - 180;
    var newLatitude = Math.min(90, Math.max(-90, this.state.center[1] + latitude));
    this.setState({
      center: [newLongitude, newLatitude]
    });
  },

  addPointLabel: function(longitude, latitude, labelText) {
    this.state.labels.push({
      type: 'point',
      coordinates: [longitude, latitude],
      labelText: labelText
    });
    this.setState({ labels: this.state.labels });
  },

  addCityLabel: function(cityName) {
    this.state.labels.push({
      type: 'city-show',
      name: cityName 
    });
    this.setState({ labels: this.state.labels });
  },

  hideCityLabel: function(cityName) {
    this.state.labels.push({
      type: 'city-hide',
      name: cityName 
    });
    this.setState({ labels: this.state.labels });
  },

  removeLabel: function(index) {
    this.state.labels.splice(index, 1);
    this.setState({ labels: this.state.labels });
  },

  updateDatasets: function(datasets) {
    this.setState({datasets: datasets});
  },

  usePreset: function(info) {
    if (info.zoomDataset && info.zoomPathName) {
      var d = datasetOptions[info.zoomDataset];

      var filename = d.filename;
      var name = filename.substring(0, filename.length - 5);
      jsonGetter(filename, function(json) {
        var features = topojson.feature(json, json.objects[name]).features;
        var feature = features.filter(function(f) { return f.properties.name === info.zoomPathName; })[0];
        if (feature) {
          var p = BoundingBoxHelper.getProjectionToBound(
            {
              rotate: this.state.rotate,
              center: this.state.center,
              scale: this.state.scaleRatio * Math.max(this.state.width, this.state.height),
              clipAngle: this.state.clipAngle,
              precision: this.state.precision,
              projectionType: this.state.projectionType,
              parallels: this.state.parallels,
              translate: [this.state.width / 2, this.state.height / 2],
              clipExtent: [[0, 0], [this.state.width, this.state.height]]
            },
            feature,
            this.state.width,
            this.state.height,
            1.1);

          var clipExtent = p.clipExtent();
          var w = clipExtent[1][0] - clipExtent[0][0];
          var h = clipExtent[1][1] - clipExtent[0][1];
          this.setState({
            rotate: p.rotate(),
            center: p.center(),
            scaleRatio: p.scale() / Math.max(w, h),
            clipAngle: p.clipAngle(),
            width: w,
            height: h,
            precision: p.precision(),
            parallels: p.parallels ? p.parallels() : this.state.parallels,
            datasets: info.datasets || this.state.datasets
          });
        }
      }.bind(this));
    }
    else {
      this.setState(info);
    }
  },

  render: function() {
    
    return (
      <div>
        <SubcontrollerContainer
          type={PresetController}
          title="Quick Presets"
          usePreset={this.usePreset}
        />
        <SubcontrollerContainer
          {...this.state}
          type={ProjectionController}
          title="Projection Options"
          maxScaleRatio={MAX_SCALE_RATIO}
          changeState={this.changeState}
        />
        <SubcontrollerContainer
          type={MapLabelManager}
          title={"Labels"}
          labels={this.state.labels}
          addPointLabel={this.addPointLabel}
          addCityLabel={this.addCityLabel}
          removeLabel={this.removeLabel}
          hideCityLabel={this.hideCityLabel}
        />
        <SubcontrollerContainer
          {...this.state}
          type={MapQuestionBankTag}
          title={"Question Bank Text"}
        />
        <SubcontrollerContainer
          type={DatasetController}
          title="Map Data Options"
          datasets={this.state.datasets}
          updateDatasets={this.updateDatasets}
        />
        <Map 
          {...this.state}
          translate={[this.state.width / 2, this.state.height / 2]}
          scale={this.state.scaleRatio * Math.max(this.state.width, this.state.height)}
          clipExtent={[[0, 0], [this.state.width, this.state.height]]}
          zoomIn={this.zoomIn}
          zoomOut={this.zoomOut}
        />
      </div>
    );
  }
});

React.render(<MapMaker />, document.querySelector('body'));
