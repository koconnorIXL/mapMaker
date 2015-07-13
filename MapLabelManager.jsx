
var MapLabelManager = React.createClass({
  
  addLabel: function(e) {
    var row = document.querySelector('.labelRow.options');
    var type = row.querySelector('.type select').value;
    var longitude = row.querySelector('.coordinates .longitude').value;
    var latitude = row.querySelector('.coordinates .latitude').value;
    var labelText = row.querySelector('.labelText input').value;
    this.props.addPointLabel(longitude, latitude, labelText);
  },

  removeLabel: function(e) {
    this.props.removeLabel(e.currentTarget);
  },

  render: function() {
    var counter = 1;
    var labelElements = this.props.labels.map(function(label) {
      if (label.type === 'point') {
        return (
          <div className='labelRow' key={counter++} >
            <div className='labelCell delete' onClick={this.removeLabel}>X</div>
            <div className='labelCell type'>{label.type}</div>
            <div className='labelCell coordinates'>{pointFromArray(label.coordinates)}</div>
            <div className='labelCell labelText'>{label.labelText}</div>
          </div>
        );
      }
      else if (label.type === 'city') {
        return (
          <div className='labelRow' key={counter++}>
            <div className='labelCell delete' onClick={this.removeLabel}>X</div>
            <div className='labelCell type'>{label.type}</div>
            <div className='labelCell coordiantes'></div>
            <div className='labelCell labelText'>{label.name}</div>
          </div>
        );
      }
      else {
        return (
          <div className='labelRow' key={counter++} onClick={this.removeLabel} >
          </div>
        );
      }
    }.bind(this));

    return (
      <div className="mapLabelManager">
        <div className="labelTable">
          <div key={0} className="labelRow headers">
            <div className='labelCell delete'></div>
            <div className="labelCell">Type</div>
            <div className="labelCell">Coordinates</div>
            <div className="labelCell">Text</div>
          </div>
          {labelElements}
          <div key={counter++} className="labelRow options">
            <div className='labelCell delete'></div>
            <div className="labelCell type">
              <select>
                <option>Point</option>
                <option>City</option>
              </select>
            </div>
            <div className="labelCell coordinates">
              <span>(</span>
              <input type="number" className='longitude' />
              <span>,</span>
              <input type="number" className='latitude' />
              <span>)</span>
            </div>
            <div className="labelCell labelText">
              <input />
            </div>
          </div>
        </div>
        <button onClick={this.addLabel}>Add Label</button>
      </div>
    );
  }
});

module.exports = MapLabelManager;
