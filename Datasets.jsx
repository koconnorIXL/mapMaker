var US_DATA = require('./USData.js');

module.exports = {
  'Countries': {
    filename: 'countries.json',
    collectiveName: 'countries',
    individualName: 'country',
    defaultColors: ['#d290fc', '#c678ef', '#b161db', '#9949ce', '#7f37b7'],
    subOptions: ['North America', 'South America', 'Africa', 'Europe', 'Asia', 'Oceania', 'Antarctica', 'Seven seas (open ocean)']
  },
  'States/Provinces': {
    filename: 'admin1.json',
    collectiveName: 'states_and_provinces',
    individualName: 'state_or_province',
    defaultColors: ['#d290fc', '#c678ef', '#b161db', '#9949ce', '#7f37b7'],
    subOptions: ['Australia', 'Brazil', 'Canada', 'United States of America']
  },
  'Lakes': {
    filename: 'lakes.json',
    collectiveName: 'lakes',
    individualName: 'lake',
    defaultColors: ['#A3D8E5'],
    subOptions: []
  },
  'Cities': {
    filename: 'cities.json',
    collectiveName: 'cities',
    individualName: 'city',
    defaultColors: ['#000000', '#000000', '#000000'],
    subOptions: ['North America', 'South America', 'Africa', 'Europe', 'Asia', 'Oceania', 'Antarctica', 'Seven seas (open ocean)'],
    defaultMinSize: 1000000,
    defaultFont: "Times New Roman",
    defaultFontSize: "14px"
  },
  'Disputed Boundaries': {
    filename: 'disputed_boundaries.json',
    collectiveName: 'disputed_boundaries',
    individualName: 'disputed_boundary',
    defaultColors: [],
    subOptions: []
  },
  'Soviet Union': {
    filename: 'USSR.json',
    collectiveName: 'soviet_republics',
    individualName: 'soviet_republic',
    defaultColors: ['#d290fc', '#c678ef', '#b161db', '#9949ce', '#7f37b7'],
    subOptions: []
  },
  'Counties': {
    filename: 'counties.json',
    collectiveName: 'counties',
    individualName: 'county',
    defaultColors: ['#d290fc', '#c678ef', '#b161db', '#9949ce', '#7f37b7'],
    subOptions: US_DATA.STATE_LIST
  },
  'Congressional Districts': {
    filename: 'congressional_districts.json',
    collectiveName: 'congressionalDistricts',
    individualName: 'congressionalDistrict',
    defaultColors: ['#d290fc', '#c678ef', '#b161db', '#9949ce', '#7f37b7'],
    subOptions: US_DATA.STATE_LIST 
  },
  'Colonies': {
    filename: 'colonies.json',
    collectiveName: 'colonies',
    individualName: 'colony',
    defaultColors: ['#ffffff'],
    subOptions: []
  }
};
