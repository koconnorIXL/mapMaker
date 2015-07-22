var datasetOptions = require('./Datasets.jsx');

var DatasetController = React.createClass({
  handleClick: function(e) {
    e.target.parentNode.classList.toggle('selected');
    this.updateSelected();
  },

  updateColor: function(e) {
    e.preventDefault();
    this.updateSelected();
  },

  updateSelected: function() {
    var selected = React.findDOMNode(this).querySelectorAll('.selected');
    var datasets = [];
    for (var i = 0; i < selected.length; i++) {
      var colorList = [];
      var selectedChildren = selected[i].children;
      var datasetName = selectedChildren[0].innerText;
      // If this selected element has only one child, then it is newly selected.
      // We will thus use the default colors for the dataset.
      if (selectedChildren.length <= 1) {
        colorList = datasetOptions[datasetName].defaultColors;
      }
      else {
        // Get the values from all the color pickers associated with this dataset.
        for (var j = 1; j < selectedChildren.length; j++) {
          colorList.push(selectedChildren[j].value);
        }
      }
      datasets.push({
        name: datasetName,
        colors: colorList
      });
    }
    this.props.updateDatasets(datasets);
  },

  render: function() {
    var datasetFields = [];
    for (var prop in datasetOptions) {
      if (datasetOptions.hasOwnProperty(prop)) {

        var cName = 'datasetOption';
        // Make the list of color pickers that will be displayed for this dataset. If the dataset is
        // not selected, this set is empty.
        var colorPickers = [];

        // Check if the 'datasets' list contains this option as the name of one of its objects.
        var propPassedIn = this.props.datasets.filter(function(obj) { return obj.name == prop; });
        if (propPassedIn.length > 0) {
          cName += ' selected';

          var colors = propPassedIn[0].colors;

          // If no colors have yet been specified, use the list of default colors from datasetOptions.
          if (colors == undefined) {
            colors = datasetOptions[prop].defaultColors;
          }

          for (var i = 0; i < colors.length; i++) {
            colorPickers.push(<input type="color" onChange={this.updateColor} value={colors[i]} />);
          }
        }

        datasetFields.push(<div className={cName}>
          <div 
            className="datasetName"
            onClick={this.handleClick}>
            {prop}
          </div>
          {colorPickers}
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
