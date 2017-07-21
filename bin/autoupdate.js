'use strict';

var path = require('path');
var server = require(path.resolve(__dirname, '../server/server'));

var datasource = server.datasources.db;
console.log('Updating data in: ' + datasource.name + ', connector:');
// console.log(datasource.connector);

var models = ['ComfortBox', 'User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
// var models = null; // Update all models

datasource.isActual(models, function(err, actual) {
  if (err) {
    console.log(err);
    throw err;
  }

  if (!actual) {
    datasource.autoupdate(models, function(err) {
      if (err) {
        console.log(err);
        throw err;
      }
    });
  } else {
    console.log('Data in ' + datasource.name + ' is already up to date.');
  }
});
