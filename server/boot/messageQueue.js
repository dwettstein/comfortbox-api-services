'use strict';

var amqp = require('amqplib/callback_api');

module.exports = function(server, callback) {
  if (typeof server.locals.settings.rabbitMqServer == 'undefined' || server.locals.settings.rabbitMqServer === null) {
    console.warn('RabbitMQ server config not available. Skip messageQueue boot script.');
    callback();
    return;
  }
  //console.log('RabbitMQ server config: ');
  //console.log(server.locals.settings.rabbitMqServer);

  this.host = server.locals.settings.rabbitMqServer.host;
  this.port = server.locals.settings.rabbitMqServer.port;
  this.username = server.locals.settings.rabbitMqServer.username;
  this.password = server.locals.settings.rabbitMqServer.password;

  console.log('Connecting to message queue...');
  amqp.connect('amqp://' + this.username + ':' + this.password + '@' + this.host + ':' + this.port, function(err, connection) {
    if (err) {
      console.error(err);
      return;
    }

    connection.createChannel(function(err, ch) {
      var q = 'comfort.*.online';
      ch.assertQueue(q, {durable: true});

      console.log('[*] Waiting for messages in %s. To exit press CTRL+C', q);
      ch.consume(q, function(msg) {
        console.log('[x] Received msg with routingKey "%s" and message: %s', msg.fields.routingKey.toString(), msg.content.toString());
        // TODO: Handle message...
      }, {noAck: true});
    });
  });
  callback();
};
