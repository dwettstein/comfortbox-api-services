'use strict';

var path = require('path');
var server = require(path.resolve(__dirname, '../server/server'));

var datasource = server.datasources.db;
console.log('Migrating data in: ' + datasource.name + ', connector:');
console.log(datasource.connector);

var models = null; // Migrate all models
datasource.automigrate(models, function(err) {
  if (err) {
    console.log(err);
    throw err;
  }
});
