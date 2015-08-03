var React = require('react');

function pointFromArray(a) {
  return '(' + a.join(',') + ')';
}

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

    var datasets = this.props.datasets.map(function(dataset) {
      var datasetString = "  <Dataset name=\"" + dataset.name + 
        "\" colors=[" + dataset.colors.join(', ') + 
        "] subOptions=[" + dataset.subOptions.join(', ') + "]";

      if (dataset.name == 'Cities') {
        return datasetString + ">\n    <CitiesInfo minSize=\"" + dataset.filterInfo.minSize + 
        "\" countryCapitalsOnly=\"" + dataset.filterInfo.countryCapitalsOnly +
        "\" stateCapitalsOnly=\"" + dataset.filterInfo.stateCapitalsOnly +
        "\" USOnly=\"" + dataset.filterInfo.USOnly +
        "\" font=\"" + dataset.styleInfo.font + 
        "\" fontSize=\"" + dataset.styleInfo.fontSize + 
        "\" />\n  </Dataset>\n";
      }

      return datasetString + " />\n";
    });

    var labels = this.props.labels.map(function(label) {
      if (label.type === 'point') {
        return '  <Label type=\"point\" coordinates=\"' + pointFromArray(label.coordinates) +
          '\" labelText=\"' + label.labelText + '\" />\n';
      }
      else if (label.type === 'city-show' || label.type === 'city-hide') {
        return '  <Label type=\"' + label.type + '\" name=\"' + label.name + '\" />\n';
      }
      else {
        return '';
      }
    });

    var s = "<Map>\n  <Projection " + attrs.join(' ') + " />\n" + datasets.join('') + labels.join('') + 
    "</Map>";

    return (
      <pre className="questionBankTags">{s}</pre>
    );
  },

  componentWillUnmount: function() {
    console.log('hello');
  }
});

module.exports = MapQuestionBankTag;
