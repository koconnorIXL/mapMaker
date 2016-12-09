
module.exports = function(s) {
  return s.replace(/\s/g, '_')
    .replace(/\./g, '')
    .replace(/,/g, '');
}
