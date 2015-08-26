var Dataset = function (name, colors, subOptions, pathColors, showOutline, showPathLabels, filterInfo, styleInfo) {
	this.name = name;
	this.colors = colors;
	this.subOptions = subOptions;
	this.pathColors = pathColors;
	this.showOutline = showOutline;
	this.showPathLabels = showPathLabels;
	this.filterInfo = filterInfo;
	this.styleInfo = styleInfo;
}

module.exports = Dataset;