var ProjectionController = require('./ProjectionController.jsx');
var MapLabelManager = require('./MapLabelManager.jsx');
var MapQuestionBankTag = require('./MapQuestionBankTag.jsx');
var DatasetController = require('./DatasetController.jsx');
var Map = require('./Map.jsx');


var MAX_SCALE_RATIO = 8;

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
      datasets: ['Countries', 'US States']
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
      type: 'city',
      name: cityName 
    });
  },

  removeLabel: function(index) {
    this.state.labels.splice(index, 1);
    this.setState({ labels: this.state.labels });
  },

  updateDatasets: function(datasets) {
    this.setState({datasets: datasets});
  },
  render: function() {
    
    return (
      <div>
        <ProjectionController
          {...this.state}
          maxScaleRatio={MAX_SCALE_RATIO}
          changeState={this.changeState}
        />
        <MapLabelManager 
          labels={this.state.labels}
          addPointLabel={this.addPointLabel}
          addCityLabel={this.addCityLabel}
          removeLabel={this.removeLabel}
        />
        <MapQuestionBankTag {...this.state} />
        <DatasetController
          datasets={this.state.datasets}
          updateDatasets={this.updateDatasets}
        />
        <Map 
          projectionType={this.state.projectionType}
          rotate={this.state.rotate}
          translate={[this.state.width / 2, this.state.height / 2]}
          center={this.state.center}
          scale={this.state.scaleRatio * Math.max(this.state.width, this.state.height)}
          clipAngle={this.state.clipAngle}
          clipExtent={[[0, 0], [this.state.width, this.state.height]]}
          precision={this.state.precision}
          parallels={this.state.parallels}
          labels={this.state.labels}
          zoomIn={this.zoomIn}
          zoomOut={this.zoomOut}
          dragRotate={this.dragRotate}
          datasets={this.state.datasets}
        />
      </div>
    );
  }
});

React.render(<MapMaker />, document.querySelector('body'));
