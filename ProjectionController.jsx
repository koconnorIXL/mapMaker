var React = require('react');
var getProjection = require('./ProjectionUtils.js').getProjection;
var ProjectionController = React.createClass({
 
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
        <input className='scaleRatio slider n0' type='range' onChange={this.updateSlider} min="0.0" max={this.props.maxScaleRatio} step="0.1" value={this.props.scaleRatio} />
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

module.exports = ProjectionController;
