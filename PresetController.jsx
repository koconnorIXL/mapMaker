var React = require('react');
var datasetOptions = require('./Datasets.jsx');
var Dataset = require('./Dataset.js');
var stateCapitals = require('./StateCapitals.js');

var PresetController = React.createClass({
  makeUSMap: function(e) {
    e.preventDefault();
    console.log("make US map");
    this.props.usePreset({
      rotate: [0, 0, 0],
      center: [0, 0],
      scaleRatio: 1.1,
      clipAngle: null,
      width: 700,
      height: 400,
      precision: null,
      projectionType: "albersUsa",
      parallels: [30, 60],
      labels: [],
      datasets: [
        new Dataset(
          'States/Provinces', 
          datasetOptions['States/Provinces'].defaultColors, 
          ['United States of America'],
          [])],
      showGridLines: false,
      zoomPathName: ""
    });
  },

  makeUSStateMap: function(e) {
    e.preventDefault();
    var stateName = document.querySelector('.presetController').querySelector('.zoomStateName').value;
    this.props.usePreset({
      rotate: [0, 0, 0],
      center: [0, 0],
      scaleRatio: 0.1,
      width: 700,
      height: 800,
      precision: null,
      projectionType: "mercator",
      parallels: [30, 60],
      labels: [{type: "city-show", name: stateCapitals[stateName]}],
      datasets: [
        new Dataset(
          'States/Provinces', 
          Array(datasetOptions['States/Provinces'].defaultColors.length + 1).join("#ffffff ").split(' '),
          ['United States of America'],
          [{name: stateName, color: "#379119"}]
        ),
        new Dataset(
          'Cities',
          datasetOptions['Cities'].defaultColors,
          datasetOptions['Cities'].subOptions,
          [],
          false,
          false,
          {
            minSize: 999999999, 
            countryCapitalsOnly: false, 
            stateCapitalsOnly: true, 
            USOnly: false
          },
          {
            font: "Times New Roman", 
            fontSize: "14px", 
            useStarForCountryCapitals: false, 
            useStarForStateCapitals: true,
            giveShowCitiesPrecedence: false
          }
        )
      ],
      showGridLines: false,
      zoomDataset: "States/Provinces",
      zoomPathName: stateName
    });
  },

  makeUSHighlightedMap: function(e) {
    e.preventDefault();
    var stateName = document.querySelector('.presetController').querySelector('.highlightStateName').value;
    this.props.usePreset({
      rotate: [0, 0, 0],
      center: [0, 0],
      scaleRatio: 1.1,
      clipAngle: null,
      width: 700,
      height: 400,
      precision: null,
      projectionType: "albersUsa",
      parallels: [30, 60],
      labels: [],
      datasets: [
        new Dataset(
          'States/Provinces', 
          Array(datasetOptions['States/Provinces'].defaultColors.length + 1).join("#ffffff ").split(' '),
          ['United States of America'],
          [{name: stateName, color: "#379119"}]
        )
      ],
      showGridLines: false,
      zoomPathName: ""
    });
  },
 
  render: function() {
    return (
      <div className="presetController">
        <button onClick={this.makeUSMap}>US Map</button>
        <form onSubmit={this.makeUSStateMap}>
          <div className="txt">US State Map</div>
          <div className="txt">Enter state name here:</div>
          <input className="zoomStateName" />
          <input type="submit" />
        </form>
        <form onSubmit={this.makeUSHighlightedMap}>
          <div className="txt">US Map with highlighted state</div>
          <div className="txt">Enter state name here:</div>
          <input className="highlightStateName" />
          <input type="submit" />
        </form>
      </div>
    );
  }
});

module.exports = PresetController;
