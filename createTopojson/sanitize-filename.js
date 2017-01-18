
function sanitize(name) {
  return name = name
    .replace(/ /g, '_')
    .replace('(', '')
    .replace(')', '')
    .replace("'", '')
    .replace('"', '')
};

module.exports = sanitize;
