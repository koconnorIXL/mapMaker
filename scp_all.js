var program = require('commander');
var exec = require('child_process').exec;

program.arguments('<env_name>').usage(': node scp_all.js <env_name>').parse(process.argv);
var envName = program.args[0] || 'dev';

var localBasePath = 'topojsonDatasets/countries/';
var remoteBasePath = '~/' + envName + '/code/assets/qgen_res/social_studies/maps/countries/';

console.log('Copying country files to ' + envName);

exec('scp ' + localBasePath + 'continents/* ' + remoteBasePath);
exec('scp ' + localBasePath + 'countries_high_res/* ' + remoteBasePath + 'high_res');
exec('scp ' + localBasePath + 'countries_medium_res/* ' + remoteBasePath + 'medium_res');
exec('scp ' + localBasePath + 'countries_high_res_with_disputed/* ' + remoteBasePath + 'high_res_with_disputed');
exec('scp ' + localBasePath + 'countries_medium_res_with_disputed/* ' + remoteBasePath + 'medium_res_with_disputed');
