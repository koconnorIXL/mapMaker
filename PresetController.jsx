var React = require('react');
var datasetOptions = require('./Datasets.jsx');
var Dataset = require('./Dataset.js');
var stateCapitals = require('./StateCapitals.js');
var US_DATA = require('./USData.js');

var PresetController = React.createClass({
  makeUSMap: function(e) {
    e.preventDefault();
    this.props.usePreset({
      scaleRatio: 1.1,
      width: 700,
      height: 400,
      projectionType: "albersUsa",
      labels: [],
      datasets: [
        new Dataset(
          'States/Provinces', 
          datasetOptions['States/Provinces'].defaultColors, 
          ['United States of America'],
          [],
          false
        )
      ],
      showGridLines: false,
      zoomPathName: ""
    });
  },

  makeUSStateMap: function(e) {
    e.preventDefault();
    var stateName = document.querySelector('.presetController').querySelector('.zoomStateName').value;
    this.props.usePreset({
      scaleRatio: 0.1,
      width: 700,
      projectionType: "mercator",
      labels: [{type: "city-show", name: stateCapitals[stateName]}],
      datasets: [
        new Dataset(
          'States/Provinces', 
          Array(datasetOptions['States/Provinces'].defaultColors.length + 1).join("#ffffff ").split(' '),
          ['United States of America'],
          [{name: stateName, color: "#379119"}],
          false
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

  makeCountyMap: function(e) {
    e.preventDefault();
    var stateName = document.querySelector('.presetController').querySelector('.countyStateName').value;
    this.props.usePreset({
      projectionType: "mercator",
      labels: [],
      datasets: [
        new Dataset(
          'States/Provinces', 
          Array(datasetOptions['States/Provinces'].defaultColors.length + 1).join("#ffffff ").split(' '),
          ['United States of America'],
          [],
          false
        ),
        new Dataset(
          'Counties',
          datasetOptions['Counties'].defaultColors,
          [stateName], 
          [],
          false,
          false
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
      scaleRatio: 1.1,
      width: 700,
      height: 400,
      projectionType: "albersUsa",
      labels: [],
      datasets: [
        new Dataset(
          'States/Provinces', 
          Array(datasetOptions['States/Provinces'].defaultColors.length + 1).join("#ffffff ").split(' '),
          ['United States of America'],
          [{name: stateName, color: "#379119"}],
          false
        )
      ],
      showGridLines: false,
      zoomPathName: ""
    });
  },
 
  render: function() {
    return (
      <div className="presetController">
        <div className="txt">US Map (&lt;geographicMap preset=&quot;US&quot;&gt;&lt;/geographicMap&gt;):</div>
        <button onClick={this.makeUSMap}>Get US Map</button>
        <form onSubmit={this.makeUSStateMap}>
          <div className="txt">US State Map (&lt;geographicMap preset=&quot;Alabama&quot;&gt;&lt;/geographicMap&gt;):</div>
          <div className="txt">Enter state name here:</div>
          <input className="zoomStateName" />
          <input type="submit" />
        </form>
        <form onSubmit={this.makeCountyMap}>
          <div className="txt">US State Map with counties</div>
          <div className="txt">Enter state name here:</div>
          <input className="countyStateName" />
          <input type="submit" />
        </form>
        <form onSubmit={this.makeUSHighlightedMap}>
          <div className="txt">US Map with highlighted state (&lt;geographicMap preset=&quot;US with Alabama&quot;&gt;&lt;/geographicMap&gt;):</div>
          <div className="txt">Enter state name here:</div>
          <input className="highlightStateName" />
          <input type="submit" />
        </form>
      </div>
    );
  }
});

module.exports = PresetController;
