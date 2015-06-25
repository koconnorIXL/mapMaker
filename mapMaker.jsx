var MAX_SCALE_RATIO = 8;

function pointFromArray(a) {
  return '(' + a.join(',') + ')';
}

function getProjection(props) {
  var proj = d3.geo.mercator();
  if (props.projectionType && d3.geo.hasOwnProperty(props.projectionType)) {
    proj = d3.geo[props.projectionType]();
  }

  if (props.rotate) {
    proj.rotate(props.rotate);
  }
  if (props.center) {
    proj.center(props.center);
  }
  if (props.translate) {
    proj.translate(props.translate);
  }
  if (props.scale) {
    proj.scale(props.scale);
  }
  if (props.clipAngle) {
    proj.clipAngle(props.clipAngle);
  }
  if (props.clipExtent) {
    proj.clipExtent(props.clipExtent);
  }
  if (props.precision) {
    proj.precision(props.precision);
  }
  if (props.parallels && proj.parallels) {
    proj.parallels(props.parallels);
  }
  return proj;
};

var Controller = React.createClass({
 
  update: function(e) {
    e.preventDefault();
    var fromSlider = arguments[arguments.length - 1] === 'fromSlider';
    var c = fromSlider ? 'slider' : 'fi';
    var form = document.querySelector('form');
    var newState = {
      projectionType: form.querySelector('.projectionType').value,
      center: [
        parseInt(form.querySelectorAll('.center.' + c)[0].value, 10), 
        parseInt(form.querySelectorAll('.center.' + c)[1].value, 10)
      ],
      rotate: [
        parseInt(form.querySelectorAll('.rotate.' + c)[0].value, 10),
        parseInt(form.querySelectorAll('.rotate.' + c)[1].value, 10),
        parseInt(form.querySelectorAll('.rotate.' + c)[2].value, 10)
      ],
      width: parseInt(form.querySelector('.width.' + c).value, 10),
      height: parseInt(form.querySelector('.height.' + c).value, 10),
      scaleRatio: parseFloat(form.querySelector('.scaleRatio.' + c).value),
      precision: parseInt(form.querySelector('.precision.' + c).value, 10),
      parallels: [
        parseInt(form.querySelectorAll('.parallels.' + c)[0].value, 10),
        parseInt(form.querySelectorAll('.parallels.' + c)[1].value, 10)
      ]
    };

    if (newState.projectionType === 'orthographic') {
      newState.clipAngle = parseInt(form.querySelector('.clipAngle.' + c).value, 10);
    }
    this.props.changeState(newState);
  },

  updateSlider: function(e) {
    this.update(e, 'fromSlider');
    var changed = e.target;
    var classNames = changed.getAttribute('class').split(' ');
    document.querySelector('.' + classNames[0] + '.fi' + '.' + classNames[2]).value = parseFloat(changed.value);
  },

  componentDidUpdate: function() {
    var sliders = document.querySelectorAll('.slider');
    for (var i = 0; i < sliders.length; i++) {
      var slider = sliders[i];
      var classNames = slider.getAttribute('class').split(' ');
      document.querySelector('.' + classNames[0] + '.fi' + '.' + classNames[2]).value = parseFloat(slider.value);
    }
  },

  render: function() {
    return (
      <form onSubmit={this.update}>
        <div className='txt'>Projection Type: </div>
        <select className="projectionType n0" >
          <option>mercator</option>
          <option>albers</option>
          <option>orthographic</option>
        </select>
        <div className='txt'>Center: </div>
        <input className="center slider n0" type='range' onChange={this.updateSlider} min="-180" max="180" value={this.props.center[0]} />
        <input className='center slider n1' type='range' onChange={this.updateSlider} min="-90" max="90" value={this.props.center[1]} />
        <div className='centerDisplayValue'>
          <span>(</span>
          <input className="center fi n0" type='number' defaultValue={this.props.center[0]} />
          <span>,</span>
          <input className="center fi n1" type='number' defaultValue={this.props.center[1]} />
          <span>)</span>
        </div>
        <div className='txt'>Rotation: </div>
        <input className='rotate slider n0' type='range' onChange={this.updateSlider} min="-180" max="180" value={this.props.rotate[0]} /> 
        <input className='rotate slider n1' type='range' onChange={this.updateSlider} min="-90" max="90" value={this.props.rotate[1]} /> 
        <input className='rotate slider n2' type='range' onChange={this.updateSlider} min="-180" max="180"  value={this.props.rotate[2]} />
        <div className='rotateDisplayValue'>
          <span>(</span>
          <input className='rotate fi n0' type='number' defaultValue={this.props.rotate[0]} />
          <span>,</span>
          <input className='rotate fi n1' type='number' defaultValue={this.props.rotate[1]} />
          <span>,</span>
          <input className='rotate fi n2' type='number' defaultValue={this.props.rotate[2]} />
          <span>)</span>
        </div>
        <div className='txt'>Width: </div>
        <input className='width slider n0' type='range' onChange={this.updateSlider} min="0" max="1000" value={this.props.width} />
        <div className='widthDisplayValue'>
          <input className='width fi n0' type='number' defaultValue={this.props.width} />
        </div>
        <div className='txt'>Height: </div>
        <input className='height slider n0' type='range' onChange={this.updateSlider} min="0" max="1000" value={this.props.height} />
        <div className='heightDisplayValue'>
          <input className='height fi n0' type='number' defaultValue={this.props.height} />
        </div>
        <div className='txt'>Scale Ratio: </div>
        <input className='scaleRatio slider n0' type='range' onChange={this.updateSlider} min="0.0" max={MAX_SCALE_RATIO} step="0.1" value={this.props.scaleRatio} />
        <div className='scaleRatioDisplayValue'>
          <input className='scaleRatio fi n0' type='number' min="0.0" step="0.1" defaultValue={this.props.scaleRatio} />
        </div>
        <div className='txt'>Clip Angle: </div>
        <input className='clipAngle slider n0' type='range' onChange={this.updateSlider} min="0" max="90" value={this.props.clipAngle} />
        <div className='clipAngleDisplayValue'>
          <input className='clipAngle fi n0' type='number' defaultValue={this.props.clipAngle} />
        </div>
        <div className='txt'>Precision: </div>
        <input className='precision slider n0' type='range' onChange={this.updateSlider} min="1" max="100" value={this.props.precision} />
        <div className='precisionDisplayValue'>
          <input className='precision fi n0' type='number' defaultValue={this.props.precision} />
        </div>
        <div className='txt'>Parallels: </div>
        <input className='parallels slider n0' type='range' onChange={this.updateSlider} min="0" max="90" value={this.props.parallels && this.props.parallels[0]} />
        <input className='parallels slider n1' type='range' onChange={this.updateSlider} min="0" max="90" value={this.props.parallels && this.props.parallels[1]} />
        <div className='parallelsDisplayValue'>
          <input className='parallels fi n0' type='number' defaultValue={this.props.parallels[0]} />
          <span>,</span>
          <input className='parallels fi n1' type='number' defaultValue={this.props.parallels[1]} />
        </div>
        <input type="submit" />
      </form>
    );
  }
});

var MapQuestionBankTag = React.createClass({
  
  render: function() {
    var elts = [];
    elts.push(<div className="openTag">{"<Map>"}</div>);
    elts.push(<div className="closeTag">{"</Map>"}</div>);


    var attrs = [];
    attrs.push("projectionType=\"" + this.props.projectionType + "\"");
    attrs.push("center=\"" + pointFromArray(this.props.center) + '\"');
    attrs.push("rotation=\"" + pointFromArray(this.props.rotate) + '\"');
    attrs.push("width=\"" + this.props.width + "\"");
    attrs.push("height=\"" + this.props.height + "\"");
    attrs.push("scaleRatio=\"" + this.props.scaleRatio + "\"");
    if (this.props.clipAngle && this.props.projectionType === 'orthographic') {
      attrs.push('clipAngle=\"' + this.props.clipAngle + '\"');
    }
    if (this.props.precision) {
      attrs.push('precision=\"' + this.props.precision + '\"');
    }
    if (this.props.parallels && this.props.projectionType === 'albers') {
      attrs.push('parallels=\"' + pointFromArray(this.props.parallels) + '\"');
    }

    var labels = this.props.labels.map(function(label) {
      if (label.type === 'point') {
        return '  <label type=\"point\" coordinates=\"' + pointFromArray(label.coordinates) + '\" labelText=\"' + label.labelText + '\" />\n';
      }
      else if (label.type === 'city') {
        return '  <label type=\"city\" name=\"' + label.name + '\" />\n';
      }
      else {
        return '';
      }
    });

    var s = "<Map " + attrs.join(' ') + " >\n" + labels.join('') + 
    "</Map>";

    return (
      <pre className="questionBankTags">{s}</pre>
    );
  }
});

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

var Map = React.createClass({

  render: function() {
    var projection = getProjection(this.props);
    var path = d3.geo.path().projection(projection);
    var map = this.getCountryTopoJSON();
    var usmap = this.getUSTopoJSON();
    var mesh = topojson.mesh(map, map.objects.ne_50m_admin_0_countries);
    var usStates = topojson.mesh(usmap, usmap.objects.usa);
    this.mouseDown = false;

    var counter = 0; 
    var labels = this.props.labels.map(function(label) {
      var p = projection(label.coordinates);
      return (
        <g key={counter++} className="mapLabel">
          <circle cx={p[0]} cy={p[1]} r={3} />
          <text x={p[0]} y={p[1]} textAnchor="start" dx="5">{label.labelText}</text>
        </g>
      );
    });

    return (
      <svg 
        className="map" 
        xmlns="http://www.w3.org/2000/svg" 
        width='800' 
        height='800'
        onWheel={this.handleMouseWheel}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        {labels}
        <path className="countries" d={path(mesh)} />
        <path className="us-states" d={path(usStates)} />
      </svg>
    );
  },
  
  handleMouseDown: function(e) {
    e.preventDefault();
    this.mouseDown = true;
  },

  handleMouseUp: function(e) {
    this.mouseDown = false;
    this.lastX = null;
    this.lastY = null;
  },

  handleMouseMove: function(e) {
    if (this.mouseDown) {
      if (this.lastX) {
        var dx = e.pageX - this.lastX;
        var dy = e.pageY - this.lastY;
        this.props.dragRotate(dx, dy);
      }
      this.lastX = e.pageX;
      this.lastY = e.pageY;
    }
  },

  handleMouseWheel: function(e) {
    e.preventDefault();
    if (e.deltaY > 0) {
      this.props.zoomOut();
    }
    else if (e.deltaY < 0) {
      this.props.zoomIn();
    }
  },


  getCountryTopoJSON: function() {
    if (!this.countrytopojson) {
      jQuery.ajaxSetup({async: false});
      this.countrytopojson = JSON.parse($.get('countries.json').responseText);
      jQuery.ajaxSetup({async: true});
    }
    return this.countrytopojson;
  },
  getUSTopoJSON: function() {
    if (!this.ustopojson) {
      jQuery.ajaxSetup({async: false});
      this.ustopojson = JSON.parse($.get('usatopojson.json').responseText);
      jQuery.ajaxSetup({async: true});
    }
    return this.ustopojson;
  },
});

var MapWithController = React.createClass({
  
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
      labels: []
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

  render: function() {
    
    return (
      <div>
        <Controller
          {...this.state}
          changeState={this.changeState}
        />
        <MapLabelManager 
          labels={this.state.labels}
          addPointLabel={this.addPointLabel}
          addCityLabel={this.addCityLabel}
          removeLabel={this.removeLabel}
        />
        <MapQuestionBankTag {...this.state} />
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
        />
      </div>
    );
  }
});

React.render(<MapWithController />, document.querySelector('body'));

