var React = require('react');
var datasetOptions = require('./Datasets.jsx');
var Dataset = require('./Dataset.js');

var DatasetController = React.createClass({
  handleClick: function(e) {
    e.target.parentNode.classList.toggle('selected');
    this.updateSelected();
  },

  updateColor: function(e) {
    e.preventDefault();
    this.updateSelected();
  },

  handleSubOptionClick: function(e) {
    e.target.classList.toggle('selectedSubOption');
    this.updateSelected();
  },

  handleFilterChange: function(e) {
    e.preventDefault();
    this.updateSelected();
  },

  updateSelected: function() {
    var selectedDatasets = React.findDOMNode(this).querySelectorAll('.selected');
    var datasets = [];
    for (var i = 0; i < selectedDatasets.length; i++) {
      var selectedChildren = selectedDatasets[i].children;
      var datasetName = selectedChildren[0].innerText;

      // Get the colors for this dataset.
      // If there are no color pickers in the color pickers div, this dataset is newly selected,
      // so we will use the default colors for the dataset.
      var colorList = [];
      var datasetColors = selectedChildren[1].children;
      if (datasetColors.length < 1) {
        colorList = datasetOptions[datasetName].defaultColors;
      }
      else {
        // Get the values from all the color pickers associated with this dataset.
        for (var j = 0; j < datasetColors.length; j++) {
          colorList.push(datasetColors[j].value);
        }
      }

      // Get all the selected sub-options for the dataset.
      // If there are no sub-options listed, we will select all sub-options by default.
      var subOptionsList = [];
      var datasetSubOptions = selectedChildren[2].children;
      if (datasetSubOptions.length < 1) {
        subOptionsList = datasetOptions[datasetName].subOptions;
      }
      else {
        // Get all selected sub-options.
        var selectedSubOptionComponents = 
          React.findDOMNode(this.refs[datasetName]).querySelectorAll('.selectedSubOption');
        for (var j = 0; j < selectedSubOptionComponents.length; j++) {
          subOptionsList.push(selectedSubOptionComponents[j].innerText);
        }
      }

      // For cities, there are filter selectors whose values need to be passed along. For all other datasets, these
      // values will be irrelevant.
      var cityMinSize = null;
      var countryCapitalsOnly = false;
      var stateCapitalsOnly = false;
      var USOnly = false;
      if (datasetName == 'Cities') {
        var cityMinSizeInput = React.findDOMNode(this.refs[datasetName]).querySelector('.cityMinSizeFillIn');
        var countryCapitalsOnlyInput = React.findDOMNode(this.refs[datasetName]).querySelector('.countryCapitalsOnly');
        var stateCapitalsOnlyInput = React.findDOMNode(this.refs[datasetName]).querySelector('.stateCapitalsOnly');
        var USOnlyInput = React.findDOMNode(this.refs[datasetName]).querySelector('.USOnly');

        if (cityMinSizeInput === null) {
          // 'Cities' has just been newly selected, so we use the default minimum size.
          cityMinSize = datasetOptions[datasetName].defaultMinSize;
        } else {
          cityMinSize = cityMinSizeInput.value;
          countryCapitalsOnly = countryCapitalsOnlyInput.checked;
          stateCapitalsOnly = stateCapitalsOnlyInput.checked;
          USOnly = USOnlyInput.checked;
        }
      }

      datasets.push(
        new Dataset(
          datasetName, 
          colorList, 
          subOptionsList, 
          {minSize: cityMinSize, countryCapitalsOnly: countryCapitalsOnly, stateCapitalsOnly: stateCapitalsOnly, USOnly: USOnly}));
    }

    this.props.updateDatasets(datasets);
  },

  render: function() {
    var datasetFields = [];
    for (var prop in datasetOptions) {
      if (datasetOptions.hasOwnProperty(prop)) {

        var overallClassName = 'datasetOption';
        // Make the list of color pickers that will be displayed for this dataset. If the dataset is
        // not selected, this set is empty.
        var colorPickers = [];

        // Make the list of selectors for sub-options.
        var subOptionSelectors = [];

        // This variable will hold the form for selecting filters for the cities to display.
        var cityFilterInput;

        // Check if the 'datasets' list contains this option as the name of one of its objects.
        // If so, we will display color pickers and sub-options.
        var propPassedIn = this.props.datasets.filter(function(obj) { return obj.name == prop; });
        if (propPassedIn.length > 0) {
          overallClassName += ' selected';

          var colors = propPassedIn[0].colors;

          // If no colors have yet been specified, use the list of default colors from datasetOptions.
          if (colors == undefined) {
            colors = datasetOptions[prop].defaultColors;
          }

          for (var i = 0; i < colors.length; i++) {
            colorPickers.push(<input type="color" onChange={this.updateColor} value={colors[i]} />);
          }

          // Create the sub-option selectors.
          var possibleSubOptions = datasetOptions[prop].subOptions;
          var selectedSubOptions = propPassedIn[0].subOptions;

          for (var i = 0; i < possibleSubOptions.length; i++) {
            var subOptionClassName = 'datasetSubOption';
            if (selectedSubOptions.indexOf(possibleSubOptions[i]) !== -1) {
              subOptionClassName += ' selectedSubOption';
            }
            subOptionSelectors.push(<div className={subOptionClassName} onClick={this.handleSubOptionClick}>
              {possibleSubOptions[i]}
            </div>);
          }

          // For the 'cities' dataset, we have multiple filters to reduce the number of cities displayed.
          if (prop == 'Cities') {
            cityFilterInput = <form className="filterInput" onSubmit={this.handleFilterChange}>
              <div className="txt">Minimum size of city to display (0-10):</div>
              <input className="cityMinSizeFillIn" type="number" defaultValue={propPassedIn[0].filterInfo.minSize} />
              <br />
              <input className="countryCapitalsOnly" type="checkbox">Country capitals only?</input>
              <br />
              <input className="stateCapitalsOnly" type="checkbox">State capitals only?</input>
              <br />
              <input className="USOnly" type="checkbox">US cities only?</input>
              <br />
              <input type="submit" />
            </form>;
          }
        }

        datasetFields.push(<div className={overallClassName} ref={prop}>
          <div 
            className="datasetName"
            onClick={this.handleClick}>
            {prop}
          </div>
          <div className="datasetColors">
            {colorPickers}
          </div>
          <div className="datasetSubOptions">
            {subOptionSelectors}
          </div>
          {cityFilterInput}
          <hr />
        </div>);
      }
    }
                                                  
    return (
      <div className="datasetController">
        {datasetFields}
      </div>
    );
  }
});

module.exports = DatasetController;
