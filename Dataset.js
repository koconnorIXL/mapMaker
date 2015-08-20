var Dataset = function (name, colors, subOptions, pathColors, showOutline, filterInfo, styleInfo) {
	this.name = name;
	this.colors = colors;
	this.subOptions = subOptions;
	this.pathColors = pathColors;
	this.showOutline = showOutline;
	this.filterInfo = filterInfo;
	this.styleInfo = styleInfo;
}

module.exports = Dataset;