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

      console.log('[MQ] Waiting for messages in %s. To exit press CTRL+C', q);
      ch.consume(q, handleMsg.bind(this), {noAck: true});
    }.bind(this));
  }.bind(server));
  callback();
};

function handleMsg(msg) {
  console.log('[MQ] Received msg with routingKey "%s" and message: %s', msg.fields.routingKey.toString(), msg.content.toString());
  if (msg.fields.routingKey.toString().startsWith('comfort.') && msg.fields.routingKey.toString().endsWith('.online')) {
    this.particleId = msg.fields.routingKey.toString().split('.')[1];
  } else {
    console.error('[MQ] ParticleId of ComfortBox not found in received routingKey!');
    return;
  }

  // Get ComfortBox name from Particle.
  this.models.ComfortBox.prototype.isOnline.bind(this)(function(err, result) {
    if (err) {
      console.error(err);
      return;
    }

    if (typeof result.id == 'undefined' || result.id === null) {
      console.warn('[MQ] ParticleId in received routingKey does not exist in Particle! You won\'t be able to configure this box through this API.');
      result.id = this.particleId;
    }

    if (typeof result.name == 'undefined' || result.name === null) {
      console.warn('[MQ] ParticleId in received routingKey does not exist in Particle! Unable to get the device name.');
      result.name = 'unknown';
    }

    // Check if an instance with given id already exists, if not create a new one.
    this.models.ComfortBox.findOrCreate(
      {where: {particleId: result.id}},
      {name: result.name, particleId: result.id},
      null,
      function(err, instance, created) {
        if (err) {
          console.error(err);
          return;
        }
        if (created) {
          console.log('[MQ] A new ComfortBox instance has been created: id: ' + JSON.stringify(instance));
        } else {
          console.log('[MQ] Existing ComfortBox instance found: id: ' + JSON.stringify(instance));
        }
        // TODO: Acknowledge message.
      });
  }.bind(this));
}
