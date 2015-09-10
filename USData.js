var DATA = [
  {
    NAME: 'Alabama',
    ABBREVIATION: 'AL',
    STATEFP: '01'
  },
  {
    NAME: 'Alaska',
    ABBREVIATION: 'AK',
    STATEFP: '02'
  },
  {
    NAME: 'Arizona',
    ABBREVIATION: 'AZ',
    STATEFP: '04'
  },
  {
    NAME: 'Arkansas',
    ABBREVIATION: 'AR',
    STATEFP: '05'
  },
  {
    NAME: 'California',
    ABBREVIATION: 'CA',
    STATEFP: '06'
  },
  {
    NAME: 'Colorado',
    ABBREVIATION: 'CO',
    STATEFP: '08'
  },
  {
    NAME: 'Connecticut',
    ABBREVIATION: 'CT',
    STATEFP: '09'
  },
  {
    NAME: 'Delaware',
    ABBREVIATION: 'DE',
    STATEFP: '10'
  },
  {
    NAME: 'Florida',
    ABBREVIATION: 'FL',
    STATEFP: '12'
  },
  {
    NAME: 'Georgia',
    ABBREVIATION: 'GA',
    STATEFP: '13'
  },
  {
    NAME: 'Hawaii',
    ABBREVIATION: 'HI',
    STATEFP: '15'
  },
  {
    NAME: 'Idaho',
    ABBREVIATION: 'ID',
    STATEFP: '16'
  },
  {
    NAME: 'Illinois',
    ABBREVIATION: 'IL',
    STATEFP: '17'
  },
  {
    NAME: 'Indiana',
    ABBREVIATION: 'IN',
    STATEFP: '18'
  },
  {
    NAME: 'Iowa',
    ABBREVIATION: 'IA',
    STATEFP: '19'
  },
  {
    NAME: 'Kansas',
    ABBREVIATION: 'KS',
    STATEFP: '20'
  },
  {
    NAME: 'Kentucky',
    ABBREVIATION: 'KY',
    STATEFP: '21'
  },
  {
    NAME: 'Louisiana',
    ABBREVIATION: 'LA',
    STATEFP: '22'
  },
  {
    NAME: 'Maine',
    ABBREVIATION: 'ME',
    STATEFP: '23'
  },
  {
    NAME: 'Maryland',
    ABBREVIATION: 'MD',
    STATEFP: '24'
  },
  {
    NAME: 'Massachusetts',
    ABBREVIATION: 'MA',
    STATEFP: '25'
  },
  {
    NAME: 'Michigan',
    ABBREVIATION: 'MI',
    STATEFP: '26'
  },
  {
    NAME: 'Minnesota',
    ABBREVIATION: 'MN',
    STATEFP: '27'
  },
  {
    NAME: 'Mississippi',
    ABBREVIATION: 'MS',
    STATEFP: '28'
  },
  {
    NAME: 'Missouri',
    ABBREVIATION: 'MO',
    STATEFP: '29'
  },
  {
    NAME: 'Montana',
    ABBREVIATION: 'MT',
    STATEFP: '30'
  },
  {
    NAME: 'Nebraska',
    ABBREVIATION: 'NE',
    STATEFP: '31'
  },
  {
    NAME: 'Nevada',
    ABBREVIATION: 'NV',
    STATEFP: '32'
  },
  {
    NAME: 'New Hampshire',
    ABBREVIATION: 'NH',
    STATEFP: '33'
  },
  {
    NAME: 'New Jersey',
    ABBREVIATION: 'NJ',
    STATEFP: '34'
  },
  {
    NAME: 'New Mexico',
    ABBREVIATION: 'NM',
    STATEFP: '35'
  },
  {
    NAME: 'New York',
    ABBREVIATION: 'NY',
    STATEFP: '36'
  },
  {
    NAME: 'North Carolina',
    ABBREVIATION: 'NC',
    STATEFP: '37'
  },
  {
    NAME: 'North Dakota',
    ABBREVIATION: 'ND',
    STATEFP: '38'
  },
  {
    NAME: 'Ohio',
    ABBREVIATION: 'OH',
    STATEFP: '39'
  },
  {
    NAME: 'Oklahoma',
    ABBREVIATION: 'OK',
    STATEFP: '40'
  },
  {
    NAME: 'Oregon',
    ABBREVIATION: 'OR',
    STATEFP: '41'
  },
  {
    NAME: 'Pennsylvania',
    ABBREVIATION: 'PA',
    STATEFP: '42'
  },
  {
    NAME: 'Rhode Island',
    ABBREVIATION: 'RI',
    STATEFP: '44'
  },
  {
    NAME: 'South Carolina',
    ABBREVIATION: 'SC',
    STATEFP: '45'
  },
  {
    NAME: 'South Dakota',
    ABBREVIATION: 'SD',
    STATEFP: '46'
  },
  {
    NAME: 'Tennessee',
    ABBREVIATION: 'TN',
    STATEFP: '47'
  },
  {
    NAME: 'Texas',
    ABBREVIATION: 'TX',
    STATEFP: '48'
  },
  {
    NAME: 'Utah',
    ABBREVIATION: 'UT',
    STATEFP: '49'
  },
  {
    NAME: 'Vermont',
    ABBREVIATION: 'VT',
    STATEFP: '50'
  },
  {
    NAME: 'Virginia',
    ABBREVIATION: 'VA',
    STATEFP: '51'
  },
  {
    NAME: 'Washington',
    ABBREVIATION: 'WA',
    STATEFP: '53'
  },
  {
    NAME: 'West Virginia',
    ABBREVIATION: 'WV',
    STATEFP: '54'
  },
  {
    NAME: 'Wisconsin',
    ABBREVIATION: 'WI',
    STATEFP: '55'
  },
  {
    NAME: 'Wyoming',
    ABBREVIATION: 'WY',
    STATEFP: '56'
  }
];

function stateToAbbreviation(stateName) {
  var d = DATA.filter(function(d) { return d.NAME === stateName; })[0];
  if (d) {
    return d.ABBREVIATION;
  }
}

function stateToFP(stateName) {
  var d = DATA.filter(function(d) { return d.NAME === stateName; })[0];
  if (d) {
    return d.STATEFP;
  }
}

function stateFromAbbreviation(stateAbbreviation) {
  var d = DATA.filter(function(d) { return d.ABBREVIATION === stateAbbreviation; })[0];
  if (d) {
    return d.NAME;
  }
}

function stateFromFP(stateFP) {
  var d = DATA.filter(function(d) { return d.STATEFP === stateFP; })[0];
  if (d) {
    return d.NAME;
  }
}

exports.STATE_LIST = DATA.map(function(d) { return d.NAME; });
exports.STATE_ABBREVIATION_LIST = DATA.map(function(d) { d.ABBREVIATION; });
exports.stateToAbbreviation = stateToAbbreviation;
exports.stateFromAbbreviation = stateFromAbbreviation;
exports.stateToFP = stateToFP;
exports.stateFromFP = stateFromFP;

