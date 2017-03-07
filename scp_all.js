var program = require('commander');
var exec = require('child_process').exec;

program.arguments('<env_name> <server> <user>').usage(': node scp_all.js <env_name> <server> <user>').parse(process.argv);
var envName = program.args[0] || 'dev';
var serverName = program.args[1] || 'quasar';
var username = program.args[2] || 'koconnor';

var localBasePath = 'topojsonDatasets/countries/';
var remoteBasePath = '/' + serverName + '_home/' + username + '/' + envName + '/code/assets/qgen_res/social_studies/maps/countries/';

console.log('Copying country files to ' + envName);

exec('scp ' + localBasePath + 'continents/* ixl:' + remoteBasePath);
exec('scp ' + localBasePath + 'countries_high_res/* ixl:' + remoteBasePath + 'high_res');
exec('scp ' + localBasePath + 'countries_medium_res/* ixl:' + remoteBasePath + 'medium_res');
exec('scp ' + localBasePath + 'countries_high_res_with_disputed/* ixl:' + remoteBasePath + 'high_res_with_disputed');
exec('scp ' + localBasePath + 'countries_medium_res_with_disputed/* ixl:' + remoteBasePath + 'medium_res_with_disputed');
