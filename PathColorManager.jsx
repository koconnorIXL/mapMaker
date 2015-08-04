var React = require('react');
var datasetOptions = require('./Datasets.jsx');

var PathColorManager = React.createClass({

  getInitialState: function() {
    return {options: {} };
  },

  changeColor: function(index, e) {
    var color = e.target.value;
    this.props.updatePathColor(
      {action: "change", datasetName: this.props.datasetName, index: index, color: color});
  },

  addPath: function(e) {
    // get information from the form's fields.
    var row = document.querySelector('.pathRow.options.' + datasetOptions[this.props.datasetName].collectiveName);
    var name = row.querySelector('.name select').value;
    var color = row.querySelector('.color input').value;

    this.props.updatePathColor(
      {action: "add", datasetName: this.props.datasetName, name: name, color: color});
  },

  removePath: function(index, e) {
    this.props.updatePathColor(
      {action: "remove", datasetName: this.props.datasetName, index: index});
  },

  fillOptions: function(options) {
    React.findDOMNode(this.refs.nameSelect).innerHTML = {options};
  },

  componentDidMount: function() {
    // We need to load the file for this dataset to know what the options for paths are.
    var datasetFilename = datasetOptions[this.props.datasetName].filename;
    d3.json('topojsonDatasets/' + datasetFilename, function(err, json) {
      if (err) { return console.log(err); }
        
      var options = json.objects[datasetFilename.substring(0, datasetFilename.length - 5)].geometries.map(
        function(path) { return <option>{path.properties.name}</option>; });
      this.setState({options: options});
    }.bind(this));
  },

  render: function() {

    // Make an element for each path that already has a specified color.
    var pathElements = this.props.paths.map(function(path, index) {
      return (
        <div className='pathRow' key={index + 1}>
          <div className='pathCell notSelectable txt' onClick={this.removePath.bind(null, index)}>X</div>
          <div className='pathCell notSelectable txt'>{path.name}</div>
          <div className='pathCell color'>
            <input type="color" value={path.color} onChange={this.changeColor.bind(null, index)} />
          </div>
        </div>
      );
    }.bind(this));

    return (
      <div className="pathColorManager">
        <br />
        <div className='txt notSelectable'>Select specific colors for elements of this dataset here:</div>
        <div className="pathTable">
          <div key={0} className="pathRow headers">
            <div className='pathCell delete'></div>
            <div className="pathCell notSelectable">Name</div>
            <div className="pathCell notSelectable">Color</div>
          </div>
          {pathElements}
          <div 
            key={pathElements.length + 1} 
            className={"pathRow options " + datasetOptions[this.props.datasetName].collectiveName}>
            <div className='pathCell delete'></div>
            <div className="pathCell name">
              <select>
                {this.state.options}
              </select>
            </div>
            <div className="pathCell color">
              <input type="color"/>
            </div>
          </div>
        </div>
        <button onClick={this.addPath}>Add path</button>
      </div>
    );
  }
});

module.exports = PathColorManager;
