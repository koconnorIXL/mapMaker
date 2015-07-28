var React = require('react');

var SubcontrollerContainer = React.createClass({

  getInitialState: function() {
    return {
      minimized: false
    };
  },

  toggleMinimized: function() {
    this.setState({
      minimized: !this.state.minimized
    });
  },

  render: function() {
    var outerClassName = 'subcontrollerContainer';
    if (this.state.minimized) { outerClassName += ' minimized' }
    else { outerClassName += ' maximized' }
    return (
      <div className={outerClassName} >
        <div 
          className="title"
          onClick={this.toggleMinimized}
        >
          {this.props.title}
        </div>
        <div 
          className="minimizeButton"
        />
        <div className="subcontroller">
          {React.createElement(this.props.type, this.props)}
        </div>
      </div>
    );
  }
});

module.exports = SubcontrollerContainer;
