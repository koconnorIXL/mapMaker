var React = require('react');
var datasetOptions = require('./Datasets.jsx');
var Dataset = require('./Dataset.js');
var PathColorManager = require('./PathColorManager.jsx');

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

  updatePathColor: function(pathColorObject) {
    this.updateSelected(pathColorObject);
  },

  updateSelected: function(pathColorObject) {
    var selectedDatasets = React.findDOMNode(this).querySelectorAll('.selected');
    var datasets = [];
    for (var i = 0; i < selectedDatasets.length; i++) {
      var selectedChildren = selectedDatasets[i].children;
      var datasetName = selectedChildren[0].innerText;

      // Get the colors for this dataset.
      // If there are no color pickers in the color pickers div, this dataset is newly selected,
      // so we will use the default colors for the dataset.
      var colorList = [];
      var datasetColors = selectedChildren[2].children;
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
      var datasetSubOptions = selectedChildren[3].children;
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

      // Get the list of paths for which different colors have been specified.
      var pathColors = [];
      var propPassedIn = this.props.datasets.filter(function(obj) { return obj.name == datasetName; });
      if (propPassedIn.length > 0) {
        pathColors = propPassedIn[0].pathColors;
      }
      // If this.state contains a change to be made to this pathColors list, make that change.
      if (pathColorObject !== undefined && 
        pathColorObject.datasetName === datasetName) {
        switch(pathColorObject.action) {
          case "remove":
            pathColors.splice(pathColorObject.index, 1);
            break;
          case "add":
            pathColors.push({name: pathColorObject.name, color: pathColorObject.color});
            break;
          case "change":
            pathColors[pathColorObject.index].color = pathColorObject.color;
        }
      }

      // Only non-city datasets have these options.
      var showOutline = false;
      var showPathLabels = false;


      // For cities, there are extra options whose values need to be passed along. For all other datasets, these
      // values will be irrelevant.
      var cityMinSize = null;
      var countryCapitalsOnly = false;
      var stateCapitalsOnly = false;
      var useStarForCountryCapitals = true;
      var useStarForStateCapitals = false;
      var USOnly = false;
      var giveShowCitiesPrecedence = true;
      var font;
      var fontSize;
      if (datasetName == 'Cities') {
        var cityMinSizeInput = React.findDOMNode(this.refs[datasetName]).querySelector('.cityMinSizeFillIn');
        var countryCapitalsOnlyInput = React.findDOMNode(this.refs[datasetName]).querySelector('.countryCapitalsOnly');
        var stateCapitalsOnlyInput = React.findDOMNode(this.refs[datasetName]).querySelector('.stateCapitalsOnly');
        var USOnlyInput = React.findDOMNode(this.refs[datasetName]).querySelector('.USOnly');
        var fontInput = React.findDOMNode(this.refs[datasetName]).querySelector('.fontFillIn');
        var fontSizeInput = React.findDOMNode(this.refs[datasetName]).querySelector('.fontSizeFillIn');
        var useStarForStateCapitalsInput = React.findDOMNode(this.refs[datasetName]).querySelector('.useStarForStateCapitals');
        var useStarForCountryCapitalsInput = React.findDOMNode(this.refs[datasetName]).querySelector('.useStarForCountryCapitals');
        var giveShowCitiesPrecedenceInput = React.findDOMNode(this.refs[datasetName]).querySelector('.giveShowCitiesPrecedence');

        if (cityMinSizeInput === null) {
          // 'Cities' has just been newly selected, so we use the default minimum size.
          cityMinSize = datasetOptions[datasetName].defaultMinSize;
          font = datasetOptions[datasetName].defaultFont;
          fontSize = datasetOptions[datasetName].defaultFontSize;
        } else {
          // Get values from user input.
          cityMinSize = parseInt(cityMinSizeInput.value);
          font = fontInput.value;
          fontSize = fontSizeInput.value;
          countryCapitalsOnly = countryCapitalsOnlyInput.checked;
          stateCapitalsOnly = stateCapitalsOnlyInput.checked;
          USOnly = USOnlyInput.checked;
          useStarForStateCapitals = useStarForStateCapitalsInput.checked;
          useStarForCountryCapitals = useStarForCountryCapitalsInput.checked;
          giveShowCitiesPrecedence = giveShowCitiesPrecedenceInput.checked;
        }
      } else {
        // Get whether to show the outline of this dataset.
        var showOutlineInput = React.findDOMNode(this.refs[datasetName]).querySelector('.showOutlineInput');
        if (showOutlineInput) {
          showOutline = showOutlineInput.value === "Yes" ? true : false;
        }
        var showPathLabelsInput = React.findDOMNode(this.refs[datasetName]).querySelector('.showPathLabelsInput');
        if (showPathLabelsInput) {
          showPathLabels = showPathLabelsInput.value === "Yes" ? true : false;
        }
      }

      datasets.push(
        new Dataset(
          datasetName, 
          colorList, 
          subOptionsList, 
          pathColors,
          showOutline,
          showPathLabels,
          {minSize: cityMinSize, countryCapitalsOnly: countryCapitalsOnly, stateCapitalsOnly: stateCapitalsOnly, USOnly: USOnly},
          {
            font: font, 
            fontSize: fontSize, 
            useStarForCountryCapitals: useStarForCountryCapitals, 
            useStarForStateCapitals: useStarForStateCapitals, 
            giveShowCitiesPrecedence: giveShowCitiesPrecedence}));
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
        var cityFilterInput = null;

        // The instructions for picking colors for selected datasets.
        var datasetColorsText = null;

        // The mechanism for picking specific colors for specific paths.
        var pathColorManager = null;

        // Input for whether to display the outline of this dataset.
        var showOutlineInput = null;

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

          // Make the path color manager.
          pathColorManager = <PathColorManager 
            updatePathColor={this.updatePathColor} 
            datasetName={prop}
            paths={propPassedIn[0].pathColors}
          />;

          // For the 'cities' dataset, we have multiple filters to reduce the number of cities displayed.
          if (prop == 'Cities') {
            cityFilterInput = <form className="notSelectable" onSubmit={this.handleFilterChange}>
              <input className="useStarForCountryCapitals" type="checkbox" defaultChecked>Use a star icon to represent country capitals?</input>
              <input className="useStarForStateCapitals" type="checkbox">Use a star icon to represent state capitals?</input>
              <div className="txt">Minimum population of city to display:</div>
              <input className="cityMinSizeFillIn" type="number" defaultValue={propPassedIn[0].filterInfo.minSize} />
              <br />
              <input className="countryCapitalsOnly" type="checkbox">Country capitals only?</input>
              <br />
              <input className="stateCapitalsOnly" type="checkbox">State capitals only?</input>
              <br />
              <input className="USOnly" type="checkbox">US cities only?</input>
              <br />
              <input className="giveShowCitiesPrecedence" type="checkbox" defaultChecked>
                Let the 'Cities to Show' list take precedence over all other filters (as opposed to just overriding minimum size)?
              </input>
              <br />
              <div className="txt">Label font:</div>
              <input className="fontFillIn" type="text" defaultValue={propPassedIn[0].styleInfo.font} />
              <br />
              <div className="txt">Font size:</div>
              <input className="fontSizeFillIn" type="text" defaultValue={propPassedIn[0].styleInfo.fontSize} />
              <br />
              <div className="txt">To hide/show specific cities, go to the 'Labels' section.</div>
              <input type="submit" />
            </form>;

            datasetColorsText = "Pick colors to use when displaying cities (general cities, state/region capitals, country capitals):"
          } else {
            // Make the form for non-cities options.
            showOutlineInput = <form className="nonCitiesInputContainer" onSubmit={this.handleFilterChange}>
              <div className='txt'>Show dataset outline, regardless of which internal paths are shown?</div>
              <select className="showOutlineInput" >
                <option selected={this.props.showOutline}>Yes</option>
                <option selected={!this.props.showOutline}>No</option>
              </select>
              <div className='txt'>Show path labels for this dataset?</div>
              <select className="showPathLabelsInput" >
                <option selected={this.props.showPathLabels}>Yes</option>
                <option selected={!this.props.showPathLabels}>No</option>
              </select>
              <div className='txt'>Submit changes:</div>
              <input type="submit" />
            </form>;

            datasetColorsText = "Pick color(s) to use when displaying the dataset:";
          }
        }

        datasetFields.push(<div className={overallClassName} ref={prop}>
          <div 
            className="datasetName"
            onClick={this.handleClick}>
            {prop}
          </div>
          <div className="datasetColorsLabel notSelectable">
            {datasetColorsText}
          </div>
          <div className="datasetColors">
            {colorPickers}
          </div>
          <div className="datasetSubOptions">
            {subOptionSelectors}
          </div>
          <div className="datasetPathColors">
            {pathColorManager}
          </div>
          {showOutlineInput}
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
