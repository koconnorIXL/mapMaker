exports.getProjection = function(props) {
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
  proj.precision(5);
  if (props.parallels && proj.parallels) {
    proj.parallels(props.parallels);
  }
  return proj;
};

