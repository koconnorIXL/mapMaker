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

      datasets.push(new Dataset(datasetName, colorList, subOptionsList));
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

          // Some datasets do not involve sub-options. For those that do, create the sub-option selectors.
          var possibleSubOptions = datasetOptions[prop].subOptions;
          if (possibleSubOptions != undefined) {
            var selectedSubOptions = propPassedIn[0].subOptions;

            // If no options were passed in, display all subOptions as selected.
            if (selectedSubOptions == undefined) {
              selectedSubOptions = datasetOptions[prop].subOptions;
            }

            for (var i = 0; i < possibleSubOptions.length; i++) {
              var subOptionClassName = 'datasetSubOption';
              if (selectedSubOptions.indexOf(possibleSubOptions[i]) !== -1) {
                subOptionClassName += ' selectedSubOption';
              }
              subOptionSelectors.push(<div className={subOptionClassName} onClick={this.handleSubOptionClick}>
                {possibleSubOptions[i]}
              </div>);
            }
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
