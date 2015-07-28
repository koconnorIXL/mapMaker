module.exports = {
  'Countries': {
    filename: 'countries.json',
    collectiveName: 'countries',
    individualName: 'country',
    defaultColors: ['#759B18', '#528220', '#94B240', '#376626', '#669955', '#669900', '#75A319'],
    subOptions: ['North America', 'South America', 'Africa', 'Europe', 'Asia', 'Oceania', 'Antarctica', 'Seven seas (open ocean)']
  },
  'States/Provinces': {
    filename: 'admin1.json',
    collectiveName: 'states_and_provinces',
    individualName: 'state_or_province',
    defaultColors: ['#759B18', '#528220', '#94B240', '#376626', '#669955', '#669900', '#75A319'],
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
  }
};