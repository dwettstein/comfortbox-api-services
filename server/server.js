'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var fs = require('fs');
var http = require('http');
var https = require('https');

var app = module.exports = loopback();

app.start = function(httpOnly) {
  if (httpOnly === undefined) {
    httpOnly = process.env.HTTP;
  }
  var server = null;
  if (!httpOnly) {
    var options = {
      key: fs.readFileSync(app.get('privateKeyPath')).toString(),
      cert: fs.readFileSync(app.get('certificatePath')).toString(),
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }

  // start the web server
  server.listen(app.get('port'), function() {
    var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
