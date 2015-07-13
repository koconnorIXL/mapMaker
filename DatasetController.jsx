var datasetOptions = require('./Datasets.jsx');

var DatasetController = React.createClass({
  handleClick: function(e) {
    e.target.classList.toggle('selected');
    var selected = React.findDOMNode(this).querySelectorAll('.selected');
    var datasets = [];
    for (var i = 0; i < selected.length; i++) {
      datasets.push(selected[i].innerText);
    }
    this.props.updateDatasets(datasets);
  },

  render: function() {
    var datasetFields = [];
    for (var prop in datasetOptions) {
      if (datasetOptions.hasOwnProperty(prop)) {
        var cName = 'datasetOption';
        if (this.props.datasets.indexOf(prop) > -1) {
          cName += ' selected';
        }
        datasetFields.push(<div 
          className={cName}
          onClick={this.handleClick}>
            {prop}
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
